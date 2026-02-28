'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { traceKeys } from '@/lib/queries'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

const CreateTraceDialogContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function useCreateTraceDialog() {
  const ctx = useContext(CreateTraceDialogContext)
  return ctx
}

export function CreateTraceDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Option+E (Mac) / Ctrl+Alt+E (Windows) — use code so Option+E works on Mac (key can be "´")
      const isMod = e.metaKey || e.ctrlKey
      const isE = e.key?.toLowerCase() === 'e' || e.code === 'KeyE'
      if (isMod && e.altKey && isE) {
        e.preventDefault()
        e.stopPropagation()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  return (
    <CreateTraceDialogContext.Provider value={{ open, setOpen }}>
      {children}
      <CreateTraceDialogInner open={open} onOpenChange={setOpen} />
    </CreateTraceDialogContext.Provider>
  )
}

function CreateTraceDialogInner({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (traceId: string) => void
}) {
  const [title, setTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim()) return
      setIsCreating(true)
      try {
        const trace = await apiClient.createTrace(title.trim())
        queryClient.invalidateQueries({ queryKey: traceKeys.lists() })
        setTitle('')
        onOpenChange(false)
        onCreated?.(trace.id)
        router.push(`/app/traces/${trace.id}`)
      } catch (err) {
        console.error('Failed to create trace:', err)
      } finally {
        setIsCreating(false)
      }
    },
    [title, onOpenChange, onCreated, router, queryClient]
  )

  useEffect(() => {
    if (!open) return
    setTitle('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>New trace</DialogTitle>
          <DialogDescription>
            Create a trace to start logging breadcrumbs. Press ⌘⌥E (Mac) or Ctrl+Alt+E (Windows) to open this.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <Input
            placeholder="e.g. Implementing WebSocket Auth"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isCreating}
            className="bg-card border-border"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !title.trim()}>
              {isCreating ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
