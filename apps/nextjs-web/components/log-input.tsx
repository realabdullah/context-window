'use client'

import { cn } from '@/lib/utils'
import { useCallback, useRef, useState } from 'react'

const LOG_COMMANDS = [
  { slug: '/code', label: 'Code snippet' },
  { slug: '/error', label: 'Error' },
  { slug: '/text', label: 'Plain text' },
  { slug: '/insight', label: 'Insight' },
] as const

export interface LogInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  rows?: number
  'data-log-input'?: string
  'aria-label'?: string
}

export function LogInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  className,
  rows = 4,
  'data-log-input': dataLogInput,
  'aria-label': ariaLabel,
}: LogInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lineStart = value.slice(0, cursorPosition)
  const lastSlash = lineStart.lastIndexOf('/')
  const slashPart = lastSlash >= 0 ? lineStart.slice(lastSlash) : ''
  const filteredCommands = slashPart.startsWith('/')
    ? LOG_COMMANDS.filter((c) => c.slug.startsWith(slashPart))
    : []

  const openSuggestions = filteredCommands.length > 0
  const shouldShow = showSuggestions && openSuggestions

  const insertCommand = useCallback(
    (command: (typeof LOG_COMMANDS)[number]) => {
      const before = value.slice(0, cursorPosition - slashPart.length)
      const after = value.slice(cursorPosition)
      const newValue = before + command.slug + ' ' + after
      onChange(newValue)
      setShowSuggestions(false)
      setSelectedIndex(0)
      setTimeout(() => {
        textareaRef.current?.focus()
        const newPos = before.length + command.slug.length + 1
        textareaRef.current?.setSelectionRange(newPos, newPos)
      }, 0)
    },
    [value, cursorPosition, slashPart, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (shouldShow) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % filteredCommands.length)
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length)
          return
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault()
          insertCommand(filteredCommands[selectedIndex])
          return
        }
        if (e.key === 'Escape') {
          setShowSuggestions(false)
          return
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        onSubmit?.()
      }
    },
    [shouldShow, filteredCommands, selectedIndex, insertCommand, onSubmit]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value
      const pos = e.target.selectionStart ?? 0
      onChange(v)
      setCursorPosition(pos)
      if (v.slice(0, pos).includes('/')) {
        setShowSuggestions(true)
        setSelectedIndex(0)
      } else {
        setShowSuggestions(false)
      }
    },
    [onChange]
  )

  const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition((e.target as HTMLTextAreaElement).selectionStart ?? 0)
  }, [])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        data-log-input={dataLogInput}
        aria-label={ariaLabel}
        title={ariaLabel || 'Log content with slash commands'}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground font-mono text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50',
          className
        )}
      />
      {shouldShow && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-popover py-1 shadow-md"
          role="listbox"
        >
          {filteredCommands.map((cmd, i) => (
            <button
              key={cmd.slug}
              type="button"
              role="option"
              aria-selected={i === selectedIndex}
              className={cn(
                'w-full px-3 py-2 text-left text-sm font-mono',
                i === selectedIndex ? 'bg-accent/15 text-accent' : 'text-foreground hover:bg-muted/50'
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                insertCommand(cmd)
              }}
            >
              <span className="text-accent/90">{cmd.slug}</span>
              <span className="ml-2 text-muted-foreground">{cmd.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
