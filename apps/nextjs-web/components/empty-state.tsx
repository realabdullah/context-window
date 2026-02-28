import { ReactNode } from 'react'
import { Button } from './ui/button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-border/60 rounded-xl bg-card/30 animate-in fade-in duration-300">
      {icon && <div className="text-muted-foreground mb-4 text-4xl">{icon}</div>}
      <h3 className="font-display font-semibold text-foreground text-sm text-center mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground text-sm text-center mb-6 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
