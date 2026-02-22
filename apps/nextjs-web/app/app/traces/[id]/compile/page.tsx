'use client'

import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import type { Article, Log, Trace } from '@/lib/types'
import {
  COMPILE_PROVIDER_IDS,
  COMPILE_PROVIDER_LABELS,
  COMPILE_TONE_OPTIONS,
  DEFAULT_COMPILE_PROVIDER,
  DEFAULT_COMPILE_TONE,
  type CompileProviderId,
} from '@context-window/shared'
import { ArrowLeft, Copy, Download } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompilePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const traceId = params.id as string

  const [trace, setTrace] = useState<Trace | null>(null)
  const [isLoadingTrace, setIsLoadingTrace] = useState(false)
  const [provider, setProvider] = useState<CompileProviderId>(DEFAULT_COMPILE_PROVIDER)
  const [tone, setTone] = useState(DEFAULT_COMPILE_TONE)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compiled, setCompiled] = useState<Article | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Load trace
  useEffect(() => {
    if (!isAuthenticated || isLoading || !traceId) return

    const loadTrace = async () => {
      setIsLoadingTrace(true)
      try {
        const data = await apiClient.getTrace(traceId)
        setTrace(data)
      } catch (error) {
        console.error('Failed to load trace:', error)
        setError('Failed to load trace')
      } finally {
        setIsLoadingTrace(false)
      }
    }

    loadTrace()
  }, [isAuthenticated, isLoading, traceId])

  const handleCompile = async () => {
    setIsCompiling(true)
    setError(null)
    try {
      const response = await apiClient.compileTrace(traceId, provider, tone)
      setCompiled(response.article)
    } catch (err) {
      console.error('Failed to compile:', err)
      setError(err instanceof Error ? err.message : 'Failed to compile trace')
    } finally {
      setIsCompiling(false)
    }
  }

  const handleCopyMarkdown = () => {
    if (!compiled) return
    navigator.clipboard.writeText(compiled.content)
  }

  const handleDownloadMarkdown = () => {
    if (!compiled) return
    const element = document.createElement('a')
    const file = new Blob([compiled.content], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${trace?.title || 'article'}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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

  const logs: Log[] = trace.logs ?? []
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/app/traces/${traceId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Compile Trace</h1>
          </div>
        </div>
      </header>

      {/* Split-Screen View (PRD: Left = Source of Truth, Right = Article) */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Compile controls: target format + provider + button */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 border border-border rounded-lg bg-card/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70 font-mono">Target format:</span>
            <select
              aria-label="Target output format"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="px-3 py-1.5 bg-background border border-border rounded text-foreground text-sm font-mono"
            >
              {COMPILE_TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70 font-mono">Provider:</span>
            <select
              aria-label="AI provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as CompileProviderId)}
              className="px-3 py-1.5 bg-background border border-border rounded text-foreground text-sm font-mono"
            >
              {COMPILE_PROVIDER_IDS.map((id) => (
                <option key={id} value={id}>{COMPILE_PROVIDER_LABELS[id]}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleCompile} disabled={isCompiling}>
            {isCompiling ? 'Compiling...' : 'Compile Trace'}
          </Button>
          {error && (
            <span className="text-sm text-red-400">{error}</span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 min-h-[60vh]">
          {/* Left Pane: Read-only timeline (Source of Truth) */}
          <div className="border border-border rounded-lg p-6 bg-card/30 overflow-y-auto max-h-[70vh]">
            <h2 className="text-sm font-semibold text-foreground mb-4 font-mono">Source of Truth</h2>
            <div className="space-y-2 mb-4">
              <p className="text-foreground font-mono font-medium">{trace.title}</p>
              <p className="text-xs text-foreground/40">
                {logs.length} log{logs.length !== 1 ? 's' : ''} · {new Date(trace.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              {logs.length === 0 ? (
                <p className="text-sm text-foreground/50">No logs in this trace.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border border-border/50 rounded p-3 bg-background/50">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono border mb-2 ${getLogTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                    <p className="text-foreground/80 font-mono text-xs whitespace-pre-wrap wrap-break-word">
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

          {/* Right Pane: LLM-generated Article (Output) */}
          <div className="border border-border rounded-lg p-6 bg-card/30 overflow-y-auto max-h-[70vh]">
            <h2 className="text-sm font-semibold text-foreground mb-4 font-mono">Article (Output)</h2>
            {compiled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-foreground/50">
                  <span>Compiled with {compiled.aiProviderUsed}</span>
                  <span>{new Date(compiled.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="text-foreground/80 font-mono text-sm whitespace-pre-wrap wrap-break-word">
                    {compiled.content}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button size="sm" variant="outline" onClick={handleCopyMarkdown} className="gap-1 flex-1">
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownloadMarkdown} className="gap-1 flex-1">
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/50">
                <p className="text-sm font-mono">Compile to generate the article</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
