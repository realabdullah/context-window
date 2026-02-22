'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/app')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground/60">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50 flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-lg font-semibold text-accent">
            context<span className="text-foreground/60">.window</span>
          </div>
          {isAuthenticated && (
            <Link href="/app">
              <Button variant="outline" size="sm">
                Open Dashboard
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
              Understand Your{' '}
              <span className="text-accent">Context Window</span>
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Build better AI applications by tracking and analyzing how your LLM uses its context window. Trace prompts, capture outputs, and optimize your API calls.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={login}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              Sign in with GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
            >
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>

          <p className="text-xs text-foreground/40 pt-8">
            Press <kbd className="px-2 py-1 bg-card border border-border rounded">⌘K</kbd> to open commands
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/50 border-t border-border px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">
            Why developers love context.window
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="space-y-4">
              <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center text-accent font-mono font-bold">
                {'<>'}
              </div>
              <h3 className="text-lg font-semibold text-foreground">Trace Interactions</h3>
              <p className="text-foreground/70">
                Log prompts, outputs, and errors in real-time. Build a complete history of your AI interactions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4">
              <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center text-accent font-mono font-bold">
                {'🔍'}
              </div>
              <h3 className="text-lg font-semibold text-foreground">Analyze Usage</h3>
              <p className="text-foreground/70">
                Understand token consumption patterns and optimize your prompts for efficiency.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4">
              <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center text-accent font-mono font-bold">
                {'✨'}
              </div>
              <h3 className="text-lg font-semibold text-foreground">Compile & Share</h3>
              <p className="text-foreground/70">
                Convert traces to polished articles with your preferred AI model. Export as markdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-foreground/50 text-sm">
        <p>Built for developers by developers</p>
      </footer>
    </main>
  )
}
