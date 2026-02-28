import Link from 'next/link'
import { Github, ExternalLink } from 'lucide-react'

const GITHUB_REPO = 'https://github.com/realabdullah/context-window'

export function AppFooter() {
  return (
    <footer className="border-t border-border/60 px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          The AI-powered ghostwriter for your technical thoughts
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center gap-1.5"
          >
            <Github className="w-4 h-4" />
            Source
          </Link>
          <Link
            href={`${GITHUB_REPO}/blob/main/README.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center gap-1.5"
          >
            Docs
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`${GITHUB_REPO}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center gap-1.5"
          >
            Issues
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
