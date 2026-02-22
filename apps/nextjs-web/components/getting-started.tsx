'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export function GettingStarted() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen the guide
    const hasSeenGuide = localStorage.getItem('context-window-guide-seen')
    if (!hasSeenGuide) {
      setIsOpen(true)
      localStorage.setItem('context-window-guide-seen', 'true')
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <div className="border border-border rounded-lg bg-card p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-foreground text-sm">Getting Started</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-foreground/70 mb-4">
          <div className="flex gap-3">
            <span className="font-mono text-accent font-bold shrink-0">1</span>
            <p>Create a trace to start logging AI interactions</p>
          </div>
          <div className="flex gap-3">
            <span className="font-mono text-accent font-bold shrink-0">2</span>
            <p>Use slash commands <code className="bg-background/50 px-1 rounded text-xs">/code</code>, <code className="bg-background/50 px-1 rounded text-xs">/error</code>, <code className="bg-background/50 px-1 rounded text-xs">/text</code>, <code className="bg-background/50 px-1 rounded text-xs">/insight</code> in the log input, then <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">⌘↵</kbd> to append</p>
          </div>
          <div className="flex gap-3">
            <span className="font-mono text-accent font-bold shrink-0">3</span>
            <p>Compile your trace into an article with your preferred AI provider</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-foreground/50 mb-3">Pro tip: Press <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono">⌘K</kbd> for quick commands</p>
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}
