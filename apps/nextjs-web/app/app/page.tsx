'use client'

import { EmptyState } from '@/components/empty-state'
import { GettingStarted } from '@/components/getting-started'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { traceKeys } from '@/lib/queries'
import { Skeleton } from '@/components/ui/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [archiveSearch, setArchiveSearch] = useState('')
  const [newTraceTitle, setNewTraceTitle] = useState('')

  const { data: activeTraces = [], isLoading: isLoadingActive } = useQuery({
    queryKey: traceKeys.list('ACTIVE'),
    queryFn: () => apiClient.getTraces('ACTIVE'),
    enabled: !!isAuthenticated && !isLoading,
  })

  const { data: archiveTraces = [], isLoading: isLoadingArchive } = useQuery({
    queryKey: traceKeys.list('COMPILED'),
    queryFn: () => apiClient.getTraces('COMPILED'),
    enabled: !!isAuthenticated && !isLoading,
  })

  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: (title: string) => apiClient.createTrace(title),
    onSuccess: (newTrace) => {
      queryClient.invalidateQueries({ queryKey: traceKeys.lists() })
      router.push(`/app/traces/${newTrace.id}`)
    },
  })

  const handleCreateTrace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTraceTitle.trim()) return
    createMutation.mutate(newTraceTitle.trim(), {
      onSuccess: () => setNewTraceTitle(''),
    })
  }

  const isLoadingTraces = isLoadingActive || isLoadingArchive

  // Archive: full-text search over title
  const filteredArchiveTraces = useMemo(() => {
    const q = archiveSearch.trim().toLowerCase()
    if (!q) return archiveTraces
    return archiveTraces.filter((t) => t.title.toLowerCase().includes(q))
  }, [archiveTraces, archiveSearch])

  return (
    <>
      <GettingStarted />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Create Trace Section (only for active workflow) */}
        <div className="mb-8 space-y-2">
          <form onSubmit={handleCreateTrace} className="flex gap-2">
            <Input
              placeholder="Create a trace... (e.g. Implementing WebSocket Auth)"
              value={newTraceTitle}
              onChange={(e) => setNewTraceTitle(e.target.value)}
              disabled={createMutation.isPending}
              className="flex-1 bg-card border-border text-foreground"
            />
            <Button
              type="submit"
              disabled={createMutation.isPending || !newTraceTitle.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </form>
          <p className="text-xs text-foreground/40">
            Tip: Press <kbd className="px-2 py-0.5 bg-card border border-border rounded inline-block">⌘⌥E</kbd> new trace · <kbd className="px-2 py-0.5 bg-card border border-border rounded inline-block">⌘K</kbd> command palette
          </p>
        </div>

        {/* Active traces */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-foreground/80 mb-3">Active</h2>
          {isLoadingTraces ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 border border-border/60 rounded-xl bg-card/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 max-w-sm" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-20 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeTraces.length === 0 ? (
            <EmptyState
              title="No active traces"
              description="Create a trace above to start logging breadcrumbs"
            />
          ) : (
            <div className="space-y-3">
              {activeTraces.map((trace) => (
                <Link key={trace.id} href={`/app/traces/${trace.id}`}>
                  <div className="p-4 border border-border/60 rounded-xl hover:bg-card/50 transition-all duration-200 cursor-pointer group hover:border-border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                          {trace.title}
                        </h3>
                        <p className="text-sm text-foreground/50 mt-1">
                          {(trace.logs?.length ?? trace._count?.logs ?? 0)} log{(trace.logs?.length ?? trace._count?.logs ?? 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-xs text-foreground/40">
                        {new Date(trace.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Archive: COMPILED traces, full-text search */}
        <section>
          <h2 className="text-sm font-semibold text-foreground/80 mb-3">Archive</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Search archive by title..."
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              className="pl-9 bg-card border-border text-foreground"
            />
          </div>
          {isLoadingTraces ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 border border-border/60 rounded-xl bg-card/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 max-w-sm" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArchiveTraces.length === 0 ? (
            <EmptyState
              title={archiveSearch.trim() ? 'No matching traces' : 'No compiled traces yet'}
              description={archiveSearch.trim() ? 'Try a different search' : 'Hit Compile on a trace to generate an article and see it here'}
            />
          ) : (
            <div className="space-y-3">
              {filteredArchiveTraces.map((trace) => (
                <Link key={trace.id} href={`/app/traces/${trace.id}`}>
                  <div className="p-4 border border-border/60 rounded-xl hover:bg-card/50 transition-all duration-200 cursor-pointer group hover:border-border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                          {trace.title}
                        </h3>
                        <p className="text-sm text-foreground/50 mt-1">
                          {(trace.logs?.length ?? trace._count?.logs ?? 0)} log{(trace.logs?.length ?? trace._count?.logs ?? 0) !== 1 ? 's' : ''} · Compiled
                        </p>
                      </div>
                      <span className="text-xs text-foreground/40">
                        {new Date(trace.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
