'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { traceKeys } from '@/lib/queries'
import { useQueryClient } from '@tanstack/react-query'
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

  // When trace is already COMPILED, show read-only view on trace detail; redirect to avoid duplicate compile UI
  useEffect(() => {
    if (trace && trace.status === 'COMPILED') {
      router.replace(`/app/traces/${traceId}`)
    }
  }, [trace, traceId, router])

  const queryClient = useQueryClient()
  const handleCompile = async () => {
    setIsCompiling(true)
    setError(null)
    try {
      await apiClient.compileTrace(traceId, provider, tone)
      queryClient.invalidateQueries({ queryKey: traceKeys.detail(traceId) })
      queryClient.invalidateQueries({ queryKey: traceKeys.lists() })
      router.replace(`/app/traces/${traceId}`)
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 min-h-[60vh]">
          <div className="border border-border/60 rounded-xl p-6 bg-card/30 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-48" />
            <div className="border-t border-border pt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border/60 rounded-xl p-6 bg-card/30 space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!trace) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <p className="text-muted-foreground">Trace not found</p>
        <Link href="/app">
          <Button variant="outline" size="sm">Back to dashboard</Button>
        </Link>
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/app/traces/${traceId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <h1 className="font-display text-xl font-semibold text-foreground">Compile Trace</h1>
      </div>

      {/* Split-Screen View (PRD: Left = Source of Truth, Right = Article) */}
      <div>
        {/* Compile controls: target format + provider + button */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 border border-border/60 rounded-xl bg-card/30">
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
          <div className="border border-border/60 rounded-xl p-6 bg-card/30 overflow-y-auto max-h-[70vh]">
            <h2 className="font-display text-sm font-semibold text-foreground mb-4 font-mono">Source of Truth</h2>
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
          <div className="border border-border/60 rounded-xl p-6 bg-card/30 overflow-y-auto max-h-[70vh]">
            <h2 className="font-display text-sm font-semibold text-foreground mb-4 font-mono">Article (Output)</h2>
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
            ) : isCompiling ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-foreground/50">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Compiling...
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/50">
                <p className="text-sm font-mono">Hit Compile to feed your logs to the AI and generate the article</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
