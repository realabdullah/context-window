import Link from 'next/link'
import { Github, ExternalLink } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 mt-12 text-center">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 hover:text-accent transition-colors flex items-center gap-1"
          >
            <Github className="w-4 h-4" />
            Source Code
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 hover:text-accent transition-colors flex items-center gap-1"
          >
            Documentation
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 hover:text-accent transition-colors flex items-center gap-1"
          >
            Report Issue
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-xs text-foreground/40">
          Built for developers who care about understanding their AI context usage
        </p>
      </div>
    </footer>
  )
}
