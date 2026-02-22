'use client'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFocusManagement } from '@/hooks/use-focus-management'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import type { Log, Trace } from '@/lib/types'
import type { LogType } from '@context-window/shared'
import { ArrowLeft, Edit2, Save, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function TraceDetailPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const traceId = params.id as string

  const [trace, setTrace] = useState<Trace | null>(null)
  const [isLoadingTrace, setIsLoadingTrace] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [logs, setLogs] = useState<Log[]>([])
  const [view, setView] = useState<'capture' | 'article'>('capture')

  // New log form state: single input with slash-command parsing (/code, /error, /text, /insight)
  const [newLogContent, setNewLogContent] = useState('')
  const [isCreatingLog, setIsCreatingLog] = useState(false)
  const inferredLogType = ((): LogType => {
    const trimmed = newLogContent.trimStart()
    if (trimmed.startsWith('/code')) return 'CODE'
    if (trimmed.startsWith('/error')) return 'ERROR'
    if (trimmed.startsWith('/text')) return 'TEXT'
    if (trimmed.startsWith('/insight')) return 'INSIGHT'
    return 'TEXT'
  })()
  const contentWithoutSlash = (() => {
    const trimmed = newLogContent.trimStart()
    for (const cmd of ['/code', '/error', '/text', '/insight']) {
      if (trimmed.startsWith(cmd)) return trimmed.slice(cmd.length).trimStart()
    }
    return newLogContent.trim()
  })()

  // Edit log state
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editingLogContent, setEditingLogContent] = useState('')
  const addLogFormRef = useRef<HTMLFormElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Manage focus and document title
  useFocusManagement(trace?.title || 'Trace Detail')

  // Cmd+Enter to append log (PRD: zero-friction capture)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const target = e.target as HTMLElement
        if (target.getAttribute('data-log-input') === 'true') {
          e.preventDefault()
          addLogFormRef.current?.requestSubmit()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load trace
  useEffect(() => {
    if (!isAuthenticated || isLoading || !traceId) return

    const loadTrace = async () => {
      setIsLoadingTrace(true)
      try {
        const data = await apiClient.getTrace(traceId)
        setTrace(data)
        setLogs(data.logs || [])
        setEditedTitle(data.title)
      } catch (error) {
        console.error('Failed to load trace:', error)
      } finally {
        setIsLoadingTrace(false)
      }
    }

    loadTrace()
  }, [isAuthenticated, isLoading, traceId])

  const handleUpdateTitle = async () => {
    if (!trace || editedTitle === trace.title) {
      setIsEditing(false)
      return
    }

    try {
      const updated = await apiClient.updateTrace(traceId, editedTitle)
      setTrace(updated)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update trace:', error)
    }
  }

  const handleDeleteTrace = async () => {
    if (!confirm('Delete this trace? This cannot be undone.')) return

    try {
      await apiClient.deleteTrace(traceId)
      router.push('/app')
    } catch (error) {
      console.error('Failed to delete trace:', error)
    }
  }

  const handleCreateLog = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const body = contentWithoutSlash
    if (!body) return

    setIsCreatingLog(true)
    try {
      const newLog = await apiClient.createLog(traceId, inferredLogType, body)
      setLogs([...logs, newLog])
      setNewLogContent('')
    } catch (error) {
      console.error('Failed to create log:', error)
    } finally {
      setIsCreatingLog(false)
    }
  }

  const handleStartEditLog = (log: Log) => {
    setEditingLogId(log.id)
    setEditingLogContent(log.content)
  }

  const handleSaveEditLog = async (logId: string) => {
    try {
      const updated = await apiClient.updateLog(logId, { content: editingLogContent })
      setLogs(logs.map((l) => (l.id === logId ? updated : l)))
      setEditingLogId(null)
    } catch (error) {
      console.error('Failed to update log:', error)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Delete this log?')) return

    try {
      await apiClient.deleteLog(logId)
      setLogs(logs.filter((l) => l.id !== logId))
    } catch (error) {
      console.error('Failed to delete log:', error)
    }
  }

  if (isLoading || isLoadingTrace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    )
  }

  if (!trace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground/60">Trace not found</div>
      </div>
    )
  }

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'CODE':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'ERROR':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'INSIGHT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="bg-card border-border text-foreground"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleUpdateTitle}
                    className="gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedTitle(trace.title)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">{trace.title}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 text-foreground/60" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteTrace}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={view} onValueChange={(value) => setView(value as 'capture' | 'article')}>
          <TabsList className="mb-8">
            <TabsTrigger value="capture">Capture</TabsTrigger>
            <TabsTrigger value="article">Article</TabsTrigger>
          </TabsList>

          {/* Capture Tab */}
          <TabsContent value="capture" className="space-y-8">
            {/* Add Log Form (hidden when COMPILED – PRD: logs strictly read-only after compile) */}
            {trace.status !== 'COMPILED' && (
              <div className="border border-border rounded-lg p-6 bg-card/30">
                <h2 className="text-sm font-semibold text-foreground mb-4 font-mono">Add Log</h2>
                <form ref={addLogFormRef} onSubmit={handleCreateLog} className="space-y-4">
                  <textarea
                    data-log-input="true"
                    aria-label="Log content"
                    value={newLogContent}
                    onChange={(e) => setNewLogContent(e.target.value)}
                    placeholder="Enter log content... Use /code, /error, /text, or /insight"
                    disabled={isCreatingLog}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground font-mono text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/40 font-mono">
                      {inferredLogType !== 'TEXT' && (
                        <>Type: {inferredLogType}</>
                      )}
                      {inferredLogType === 'TEXT' && newLogContent.trimStart() === '' && (
                        <>Slash commands: /code, /error, /text, /insight</>
                      )}
                    </span>
                    <Button
                      type="submit"
                      disabled={isCreatingLog || !contentWithoutSlash}
                    >
                      {isCreatingLog ? 'Creating...' : 'Add Log'}
                    </Button>
                  </div>
                  <p className="text-xs text-foreground/40">
                    <kbd className="px-2 py-0.5 bg-card border border-border rounded">⌘</kbd>+<kbd className="px-2 py-0.5 bg-card border border-border rounded">Enter</kbd> to append
                  </p>
                </form>
              </div>
            )}

            {/* Logs List */}
            <div className="space-y-3">
              {logs.length === 0 ? (
                <EmptyState
                  title="No logs yet"
                  description="Add your first log above to start tracking this trace"
                />
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="group border border-border rounded-lg p-4 bg-card/30"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-mono border ${getLogTypeColor(
                          log.type
                        )}`}
                      >
                        {log.type}
                      </span>
                      {/* Edit/Delete: visible on hover only (PRD: subtle context menu); hidden when COMPILED */}
                      {trace.status !== 'COMPILED' && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingLogId === log.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleSaveEditLog(log.id)}
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingLogId(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEditLog(log)}
                                className="text-foreground/60 hover:text-foreground"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editingLogId === log.id && trace.status !== 'COMPILED' ? (
                      <textarea
                        aria-label="Edit log content"
                        value={editingLogContent}
                        onChange={(e) => setEditingLogContent(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        rows={3}
                      />
                    ) : (
                      <p className="text-foreground/80 font-mono text-sm whitespace-pre-wrap wrap-break-word">
                        {log.content}
                      </p>
                    )}
                    <p className="text-xs text-foreground/40 mt-2">
                      {new Date(log.createdAt).toLocaleString()}
                      {log.isEdited && (
                        <span className="ml-2 text-foreground/50">(edited)</span>
                      )}
                    </p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Article Tab */}
          <TabsContent value="article">
            <div className="border border-border rounded-lg p-8 bg-card/30 text-center py-24">
              <p className="text-foreground/60 mb-4">Compile your trace to generate an article</p>
              <Link href={`/app/traces/${traceId}/compile`}>
                <Button>Go to Compile</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
