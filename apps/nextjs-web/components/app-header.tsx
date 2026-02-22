import { ReactNode } from 'react'

interface AppHeaderProps {
  children: ReactNode
  className?: string
}

export function AppHeader({ children, className = '' }: AppHeaderProps) {
  return (
    <header
      className={`border-b border-border px-6 py-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 ${className}`}
      role="banner"
    >
      {children}
    </header>
  )
}
