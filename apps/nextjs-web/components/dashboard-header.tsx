'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function DashboardHeader() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="border-b border-border/60 px-6 py-4 sticky top-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link
            href="/app"
            className="font-display text-lg font-semibold tracking-tight transition-colors duration-200 hover:opacity-90 flex items-center gap-2"
          >
            <Image
              src="/favicon.svg"
              alt=""
              width={24}
              height={24}
              className="shrink-0"
            />
            <div>
              <span className="text-accent">context</span>
              <span className="text-muted-foreground">.window</span>
            </div>
          </Link>
          <nav className="hidden sm:flex gap-6 text-sm">
            <Link href="/app" className="text-foreground/60 hover:text-foreground transition-colors">
              Traces
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground/60 truncate max-w-[180px]">
            {user?.name ?? user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
