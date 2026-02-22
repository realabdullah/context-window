'use client'

export function KeyboardHint({ keys, className = '' }: { keys: string[]; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {keys.map((key, idx) => (
        <span key={idx}>
          <kbd className="px-2 py-1 bg-card border border-border rounded text-xs text-foreground/70 font-mono font-semibold">
            {key}
          </kbd>
          {idx < keys.length - 1 && <span className="text-foreground/40 mx-1">+</span>}
        </span>
      ))}
    </div>
  )
}
