'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Github, Terminal, Zap, FileText, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const GITHUB_REPO = 'https://github.com/realabdullah/context-window'

export default function LandingPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight transition-opacity duration-200 hover:opacity-90 flex items-center gap-2">
            <Image src="/favicon.svg" alt="" width={24} height={24} className="shrink-0" />
            <span className="text-accent">context</span>
            <span className="text-muted-foreground">.window</span>
          </Link>
          <nav className="flex items-center gap-4">
            {isLoading ? (
              <span className="text-sm text-muted-foreground/60">Loading…</span>
            ) : isAuthenticated ? (
              <Link href="/app">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  Open Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:inline-flex items-center gap-1.5"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <Button size="sm" onClick={login} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Sign in with GitHub
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero – asymmetric, left-aligned, distinctive */}
      <section className="flex-1 px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr,minmax(280px,400px)] gap-12 lg:gap-16 items-start">
            <div className="space-y-8 lg:space-y-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: '0ms', animationFillMode: 'both' } as React.CSSProperties}
              >
                <Terminal className="w-3.5 h-3.5" />
                IDE-like terminal feed for engineers
              </div>

              <h1
                className="font-display font-bold tracking-tight text-foreground [font-size:clamp(2.5rem,6vw,4rem)] leading-[1.1] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '80ms', animationFillMode: 'both' } as React.CSSProperties}
              >
                The ghostwriter for your{' '}
                <span className="text-accent">technical thoughts.</span>
              </h1>

              <p
                className="text-lg text-muted-foreground leading-relaxed max-w-xl [font-size:clamp(1rem,1.5vw,1.125rem)] animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '160ms', animationFillMode: 'both' } as React.CSSProperties}
              >
                Log chronological breadcrumbs as you build—code snippets, errors, quick thoughts. Hit Compile and Context Window feeds your traces to an AI that drafts a structured technical article from your raw logs.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '240ms', animationFillMode: 'both' } as React.CSSProperties}
              >
                <Button
                  size="lg"
                  onClick={() => !isLoading && (isAuthenticated ? router.push('/app') : login())}
                  disabled={isLoading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium h-12 px-8 gap-2"
                >
                  {isLoading ? 'Loading…' : isAuthenticated ? 'Open Dashboard' : 'Get started'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="lg" asChild className="h-12 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>

              <p
                className="text-xs text-muted-foreground/80 pt-4 animate-in fade-in duration-500"
                style={{ animationDelay: '320ms', animationFillMode: 'both' } as React.CSSProperties}
              >
                Press <kbd className="px-2 py-1 bg-card border border-border rounded text-[0.7rem] font-mono">⌘K</kbd> to open the command palette
              </p>
            </div>

            {/* Visual accent – terminal-style block */}
            <div
              className="relative lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-500"
              style={{ animationDelay: '200ms', animationFillMode: 'both' } as React.CSSProperties}
            >
              <div className="border border-border rounded-xl bg-card/50 p-6 font-mono text-sm overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/5">
                <div className="flex gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-destructive/60" />
                  <span className="w-3 h-3 rounded-full bg-accent/60" />
                  <span className="w-3 h-3 rounded-full bg-chart-2/60" />
                </div>
                <pre className="text-muted-foreground space-y-2 text-xs leading-relaxed">
                  <span className="text-accent">$</span> /code fetchUser()
                  <span className="block text-foreground/80">→ async function...</span>
                  <span className="text-accent">$</span> /error TypeError: undefined
                  <span className="block text-destructive/90">→ fixed with optional chaining</span>
                  <span className="text-accent">$</span> /insight Use RSC for this route
                  <span className="block text-chart-2">→ Compile → Article</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features – varied layout, no identical cards */}
      <section className="border-t border-border/60 px-6 py-20 md:py-28 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Solve the blank page problem
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Zero-friction capture, multi-model compilation, and forensic trace history.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-4 md:pr-4 transition-transform duration-300 hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg">Log breadcrumbs</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Log code snippets, errors, and quick thoughts in real time. Slash commands <code className="text-accent/90 font-mono text-xs">/code</code>, <code className="text-accent/90 font-mono text-xs">/error</code>, <code className="text-accent/90 font-mono text-xs">/text</code>, <code className="text-accent/90 font-mono text-xs">/insight</code> format instantly. Build a complete history of your technical journey.
              </p>
            </div>

            <div className="space-y-4 md:px-4 md:border-x border-border/50 transition-transform duration-300 hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-lg bg-chart-2/20 flex items-center justify-center text-chart-2">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg">Compile & share</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                When you&apos;re done, hit Compile. Context Window feeds your traces to an AI that acts as a senior engineer, drafting a structured markdown article from your breadcrumbs. Split-screen review verifies technical accuracy.
              </p>
            </div>

            <div className="space-y-4 md:pl-4 transition-transform duration-300 hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-lg bg-chart-3/20 flex items-center justify-center text-chart-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg">Soft mutability</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Logs act like immutable console outputs to preserve forensic history, but allow quick inline editing to scrub accidental secrets (like API keys) before compilation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-border/60 px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4">
            Ready to ghostwrite your technical thoughts?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign in with GitHub and start logging breadcrumbs in seconds.
          </p>
          <Button
            size="lg"
            onClick={login}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium h-12 px-8"
          >
            Sign in with GitHub
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            The AI-powered ghostwriter for your technical thoughts
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              Source
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
