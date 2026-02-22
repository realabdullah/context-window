'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  Home,
  Plus,
  LogOut,
  Search,
  FileText,
  Zap,
} from 'lucide-react'

interface Command {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  onSelect: () => void
  group: string
  shortcut?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [commands, setCommands] = useState<Command[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()

  // Register keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Build commands based on authentication state and current route
  useEffect(() => {
    const newCommands: Command[] = []

    if (isAuthenticated) {
      // Navigation commands
      newCommands.push(
        {
          id: 'dashboard',
          title: 'Go to Dashboard',
          description: 'View all traces',
          icon: <Home className="w-4 h-4" />,
          onSelect: () => {
            router.push('/app')
            setOpen(false)
          },
          group: 'Navigation',
          shortcut: '⌘G',
        },
        {
          id: 'new-trace',
          title: 'Create New Trace',
          description: 'Start a new trace',
          icon: <Plus className="w-4 h-4" />,
          onSelect: () => {
            router.push('/app')
            setOpen(false)
          },
          group: 'Actions',
          shortcut: '⌘N',
        }
      )

      // Trace-specific commands
      if (pathname.includes('/traces/')) {
        const traceId = pathname.split('/').pop()
        newCommands.push(
          {
            id: 'compile',
            title: 'Compile Trace',
            description: 'Generate article from logs',
            icon: <Zap className="w-4 h-4" />,
            onSelect: () => {
              router.push(`/app/traces/${traceId}/compile`)
              setOpen(false)
            },
            group: 'Trace',
            shortcut: '⌘⇧C',
          },
          {
            id: 'view-logs',
            title: 'View Logs',
            description: 'Back to trace',
            icon: <FileText className="w-4 h-4" />,
            onSelect: () => {
              router.push(`/app/traces/${traceId}`)
              setOpen(false)
            },
            group: 'Trace',
          }
        )
      }

      // Auth commands
      newCommands.push({
        id: 'logout',
        title: 'Sign Out',
        description: 'Log out of your account',
        icon: <LogOut className="w-4 h-4" />,
        onSelect: async () => {
          await logout()
          router.push('/')
          setOpen(false)
        },
        group: 'Account',
      })
    } else {
      newCommands.push({
        id: 'home',
        title: 'Go Home',
        description: 'Back to landing page',
        icon: <Home className="w-4 h-4" />,
        onSelect: () => {
          router.push('/')
          setOpen(false)
        },
        group: 'Navigation',
      })
    }

    setCommands(newCommands)
  }, [isAuthenticated, pathname, router])

  // Group commands by category
  const groupedCommands = commands.reduce(
    (acc, cmd) => {
      const group = acc.find((g) => g.name === cmd.group)
      if (group) {
        group.commands.push(cmd)
      } else {
        acc.push({ name: cmd.group, commands: [cmd] })
      }
      return acc
    },
    [] as Array<{ name: string; commands: Command[] }>
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        {groupedCommands.map((group) => (
          <CommandGroup key={group.name} heading={group.name}>
            {group.commands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={command.onSelect}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1">
                  {command.icon && (
                    <span className="text-foreground/60">{command.icon}</span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {command.title}
                    </p>
                    {command.description && (
                      <p className="text-xs text-foreground/50">
                        {command.description}
                      </p>
                    )}
                  </div>
                </div>
                {command.shortcut && (
                  <span className="text-xs text-foreground/40 ml-auto">
                    {command.shortcut}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="border-t border-border p-2 text-xs text-foreground/50">
        <p>Press <kbd className="px-2 py-1 bg-card rounded border border-border">⌘K</kbd> to open</p>
      </div>
    </CommandDialog>
  )
}
