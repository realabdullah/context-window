'use client'

import { X, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export function GettingStarted() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('context-window-guide-seen')
    if (!hasSeenGuide) {
      setIsOpen(true)
      localStorage.setItem('context-window-guide-seen', 'true')
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-border/60 rounded-xl bg-card/95 backdrop-blur-sm p-6 shadow-xl shadow-black/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm">Getting Started</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground mb-5">
          <div className="flex gap-3">
            <span className="font-mono text-accent font-bold shrink-0 w-5">1</span>
            <p>Create a trace to start logging technical breadcrumbs</p>
          </div>
          <div className="flex gap-3">
            <span className="font-mono text-accent font-bold shrink-0 w-5">2</span>
            <p>
              Use <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs text-accent">/code</code>, <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs text-accent">/error</code>, <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs text-accent">/text</code>, <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs text-accent">/insight</code> then <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">⌘↵</kbd> to append
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-mono text-accent font-bold shrink-0 w-5">3</span>
            <p>Hit Compile—the AI drafts a structured technical article from your logs</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground mb-3">
            Pro tip: Press <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs font-mono">⌘K</kbd> for quick commands
          </p>
          <Button size="sm" onClick={() => setIsOpen(false)} className="w-full">
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}
