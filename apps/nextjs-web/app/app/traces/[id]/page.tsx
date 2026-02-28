'use client'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { LogInput } from '@/components/log-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useFocusManagement } from '@/hooks/use-focus-management'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { traceKeys } from '@/lib/queries'
import type { Log, Trace } from '@/lib/types'
import type { LogType } from '@context-window/shared'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Copy, Download, Edit2, Save, Trash2, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function TraceDetailPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const traceId = params.id as string
  const queryClient = useQueryClient()

  const { data: trace = null, isLoading: isLoadingTrace } = useQuery({
    queryKey: traceKeys.detail(traceId),
    queryFn: () => apiClient.getTrace(traceId),
    enabled: !!isAuthenticated && !isLoading && !!traceId,
  })

  const logs = trace?.logs ?? []

  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(trace?.title ?? '')
  const [articleViewMode, setArticleViewMode] = useState<'preview' | 'raw'>('preview')

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

  // Sync editedTitle when trace loads
  useEffect(() => {
    if (trace) setEditedTitle(trace.title)
  }, [trace?.id, trace?.title])

  // Manage focus and document title
  useFocusManagement(trace?.title || 'Trace Detail')

  // Cmd+Enter to append log
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

  const invalidateTrace = () => {
    queryClient.invalidateQueries({ queryKey: traceKeys.detail(traceId) })
    queryClient.invalidateQueries({ queryKey: traceKeys.lists() })
  }

  const handleUpdateTitle = async () => {
    if (!trace || editedTitle === trace.title) {
      setIsEditing(false)
      return
    }
    try {
      await apiClient.updateTrace(traceId, editedTitle)
      invalidateTrace()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update trace:', error)
    }
  }

  const handleDeleteTrace = async () => {
    if (!confirm('Delete this trace? This cannot be undone.')) return
    try {
      await apiClient.deleteTrace(traceId)
      queryClient.invalidateQueries({ queryKey: traceKeys.lists() })
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
      await apiClient.createLog(traceId, inferredLogType, body)
      invalidateTrace()
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
      await apiClient.updateLog(logId, { content: editingLogContent })
      invalidateTrace()
      setEditingLogId(null)
    } catch (error) {
      console.error('Failed to update log:', error)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Delete this log?')) return
    try {
      await apiClient.deleteLog(logId)
      invalidateTrace()
    } catch (error) {
      console.error('Failed to delete log:', error)
    }
  }

  if (isLoading || isLoadingTrace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border/60 rounded-xl p-4 bg-card/30 space-y-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!trace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <p className="text-muted-foreground">Trace not found</p>
        <Link href="/app">
          <Button variant="outline" size="sm">Back to dashboard</Button>
        </Link>
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page toolbar: Back + title + delete */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="gap-2 shrink-0">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            {trace.status === 'COMPILED' ? (
              <h1 className="font-display text-xl font-semibold text-foreground truncate">{trace.title}</h1>
            ) : isEditing ? (
              <div className="flex gap-2 flex-wrap">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-card border-border text-foreground max-w-md"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUpdateTitle}
                  className="gap-1 hover:bg-muted/50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedTitle(trace.title)
                  }}
                  className="hover:bg-muted/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="font-display text-xl font-semibold text-foreground truncate">{trace.title}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0 text-foreground/60 hover:text-foreground hover:bg-muted/50"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteTrace}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content: compiled = side-by-side read-only; not compiled = add-log + logs + Compile CTA */}
      {trace.status === 'COMPILED' && trace.article ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[60vh]">
          {/* Left: Breadcrumbs / logs (read-only) */}
          <div className="border border-border/60 rounded-xl p-6 bg-card/30 overflow-y-auto max-h-[70vh]">
            <h2 className="text-sm font-semibold text-foreground mb-4 font-mono">Breadcrumbs</h2>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-sm text-foreground/50">No logs.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border border-border/50 rounded-lg p-3 bg-background/50">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono border mb-2 ${getLogTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                    <p className="text-foreground/80 font-mono text-sm whitespace-pre-wrap break-words">
                      {log.content}
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                      {log.isEdited && <span className="ml-2">(edited)</span>}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Right: Generated article (read-only + Copy/Download + Preview/Raw) */}
          <div className="border border-border/60 rounded-xl p-6 bg-card/30 overflow-y-auto max-h-[70vh]">
            <h2 className="text-sm font-semibold text-foreground mb-4 font-mono">Article</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/50">
                <span>Compiled with {trace.article.aiProviderUsed} · {new Date(trace.article.createdAt).toLocaleTimeString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setArticleViewMode('preview')}
                    className={`px-2 py-1 rounded font-mono ${articleViewMode === 'preview' ? 'bg-muted text-foreground' : 'hover:bg-muted/50'}`}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleViewMode('raw')}
                    className={`px-2 py-1 rounded font-mono ${articleViewMode === 'raw' ? 'bg-muted text-foreground' : 'hover:bg-muted/50'}`}
                  >
                    Raw
                  </button>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                {articleViewMode === 'preview' ? (
                  <div className="article-preview text-foreground/80 text-sm [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:leading-relaxed [&_pre]:bg-muted/50 [&_pre]:border [&_pre]:border-border [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded">
                    <ReactMarkdown>{trace.article.content}</ReactMarkdown>
                  </div>
                ) : (
                  <pre className="text-foreground/80 font-mono text-sm whitespace-pre-wrap break-words">
                    {trace.article.content}
                  </pre>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => trace.article && navigator.clipboard.writeText(trace.article.content)}
                  className="gap-1 flex-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!trace.article) return
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(new Blob([trace.article.content], { type: 'text/markdown' }))
                    a.download = `${trace.title || 'article'}.md`
                    a.click()
                    URL.revokeObjectURL(a.href)
                  }}
                  className="gap-1 flex-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Add Log Form (only when not compiled) */}
          <div className="border border-border/60 rounded-xl p-6 bg-card/30">
            <h2 className="text-sm font-semibold text-foreground mb-4 font-mono">Add Log</h2>
            <form ref={addLogFormRef} onSubmit={handleCreateLog} className="space-y-4">
              <LogInput
                data-log-input="true"
                aria-label="Log content"
                value={newLogContent}
                onChange={setNewLogContent}
                onSubmit={() => addLogFormRef.current?.requestSubmit()}
                placeholder="Log a breadcrumb... Type / for commands: /code, /error, /text, /insight"
                disabled={isCreatingLog}
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

          {/* Logs List */}
          <div className="space-y-3">
            {logs.length === 0 ? (
              <EmptyState
                title="No logs yet"
                description="Add your first breadcrumb above to start building this trace"
              />
            ) : (
              <>
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="group border border-border/60 rounded-xl p-4 bg-card/30 transition-colors duration-200 hover:border-border/80"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-mono border ${getLogTypeColor(log.type)}`}
                      >
                        {log.type}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingLogId === log.id ? (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleSaveEditLog(log.id)}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingLogId(null)}>
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
                    </div>
                    {editingLogId === log.id ? (
                      <textarea
                        aria-label="Edit log content"
                        value={editingLogContent}
                        onChange={(e) => setEditingLogContent(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        rows={3}
                      />
                    ) : (
                      <p className="text-foreground/80 font-mono text-sm whitespace-pre-wrap break-words">
                        {log.content}
                      </p>
                    )}
                    <p className="text-xs text-foreground/40 mt-2">
                      {new Date(log.createdAt).toLocaleString()}
                      {log.isEdited && <span className="ml-2 text-foreground/50">(edited)</span>}
                    </p>
                  </div>
                ))}
                <div className="pt-4">
                  <Link href={`/app/traces/${traceId}/compile`}>
                    <Button className="gap-2">
                      <Zap className="w-4 h-4" />
                      Compile
                    </Button>
                  </Link>
                  <p className="text-xs text-foreground/40 mt-2">
                    Feed logs to AI and generate a structured technical article
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

