'use client'

import { AppFooter } from '@/components/app-footer'
import { EmptyState } from '@/components/empty-state'
import { GettingStarted } from '@/components/getting-started'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import type { Trace } from '@/lib/types'
import { LogOut, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type DashboardTab = 'active' | 'archive'

export default function DashboardPage() {
  const { isAuthenticated, isLoading, logout, user } = useAuth()
  const router = useRouter()
  const [activeTraces, setActiveTraces] = useState<Trace[]>([])
  const [archiveTraces, setArchiveTraces] = useState<Trace[]>([])
  const [isLoadingTraces, setIsLoadingTraces] = useState(false)
  const [tab, setTab] = useState<DashboardTab>('active')
  const [archiveSearch, setArchiveSearch] = useState('')
  const [newTraceTitle, setNewTraceTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Load traces: Active (ACTIVE) and Archive (COMPILED/ARCHIVED)
  useEffect(() => {
    if (!isAuthenticated || isLoading) return

    const loadTraces = async () => {
      setIsLoadingTraces(true)
      try {
        const [active, archived] = await Promise.all([
          apiClient.getTraces('ACTIVE'),
          apiClient.getTraces('COMPILED'),
        ])
        setActiveTraces(active)
        setArchiveTraces(archived)
      } catch (error) {
        console.error('Failed to load traces:', error)
      } finally {
        setIsLoadingTraces(false)
      }
    }

    loadTraces()
  }, [isAuthenticated, isLoading])

  const handleCreateTrace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTraceTitle.trim()) return

    setIsCreating(true)
    try {
      const newTrace = await apiClient.createTrace(newTraceTitle)
      setActiveTraces((prev) => [newTrace, ...prev])
      setNewTraceTitle('')
      router.push(`/app/traces/${newTrace.id}`)
    } catch (error) {
      console.error('Failed to create trace:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Archive: full-text search over title (PRD: optimized for full-text search)
  const filteredArchiveTraces = useMemo(() => {
    const q = archiveSearch.trim().toLowerCase()
    if (!q) return archiveTraces
    return archiveTraces.filter((t) => t.title.toLowerCase().includes(q))
  }, [archiveTraces, archiveSearch])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+N to create new trace
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        const input = document.querySelector('input[placeholder*="Create"]') as HTMLInputElement
        if (input) input.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <GettingStarted />
      {/* Header */}
      <header className="border-b border-border px-6 py-4 sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/app" className="text-lg font-semibold text-accent">
              context<span className="text-foreground/60">.window</span>
            </Link>
            <nav className="hidden sm:flex gap-6 text-sm">
              <span className="text-foreground/60">Traces</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/60">{user?.name ?? user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-foreground/60 hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Create Trace Section (only for active workflow) */}
        <div className="mb-8 space-y-2">
          <form onSubmit={handleCreateTrace} className="flex gap-2">
            <Input
              placeholder="Create a new trace... (describe what you're testing)"
              value={newTraceTitle}
              onChange={(e) => setNewTraceTitle(e.target.value)}
              disabled={isCreating}
              className="flex-1 bg-card border-border text-foreground"
            />
            <Button
              type="submit"
              disabled={isCreating || !newTraceTitle.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </form>
          <p className="text-xs text-foreground/40">
            Tip: Press <kbd className="px-2 py-0.5 bg-card border border-border rounded inline-block">⌘N</kbd> to focus · <kbd className="px-2 py-0.5 bg-card border border-border rounded inline-block">⌘K</kbd> command palette
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as DashboardTab)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archive">Archive / Ledger</TabsTrigger>
          </TabsList>

          {/* Active traces */}
          <TabsContent value="active" className="space-y-3 mt-0">
            {isLoadingTraces ? (
              <div className="text-center py-12 text-foreground/60">Loading traces...</div>
            ) : activeTraces.length === 0 ? (
              <EmptyState
                title="No active traces"
                description="Create a trace above to start capturing logs"
              />
            ) : (
              activeTraces.map((trace) => (
                <Link key={trace.id} href={`/app/traces/${trace.id}`}>
                  <div className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors cursor-pointer group">
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
              ))
            )}
          </TabsContent>

          {/* Archive / Ledger: COMPILED traces, full-text search */}
          <TabsContent value="archive" className="space-y-4 mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search archive by title..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="pl-9 bg-card border-border text-foreground"
              />
            </div>
            {isLoadingTraces ? (
              <div className="text-center py-12 text-foreground/60">Loading archive...</div>
            ) : filteredArchiveTraces.length === 0 ? (
              <EmptyState
                title={archiveSearch.trim() ? 'No matching traces' : 'No compiled traces yet'}
                description={archiveSearch.trim() ? 'Try a different search' : 'Compile a trace to see it here'}
              />
            ) : (
              filteredArchiveTraces.map((trace) => (
                <Link key={trace.id} href={`/app/traces/${trace.id}`}>
                  <div className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors cursor-pointer group">
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
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AppFooter />
    </div>
  )
}
