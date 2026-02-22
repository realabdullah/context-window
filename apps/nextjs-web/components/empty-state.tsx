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
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-lg">
      {icon && <div className="text-foreground/40 mb-4 text-4xl">{icon}</div>}
      <h3 className="text-foreground/60 text-sm font-semibold text-center mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-foreground/40 text-xs text-center mb-4 max-w-xs">
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
