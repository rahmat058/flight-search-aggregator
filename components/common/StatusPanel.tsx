import type { ReactNode } from 'react'
import { cn } from '@/utils/twMerge'

export interface StatusPanelProps {
  title: string
  description?: ReactNode
  icon: ReactNode
  testId?: string
  card?: boolean
  iconRing?: boolean
  iconRingClassName?: string
  className?: string
  titleClassName?: string
}

export function StatusPanel({
  title,
  description,
  icon,
  testId,
  card = true,
  iconRing = true,
  iconRingClassName,
  className,
  titleClassName,
}: StatusPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        card ? 'glass-card py-16' : 'py-20',
        className,
      )}
      data-testid={testId}>
      {iconRing ? (
        <div
          className={cn(
            'mb-4 flex h-16 w-16 items-center justify-center rounded-full',
            iconRingClassName,
          )}>
          {icon}
        </div>
      ) : (
        <div className="mb-4">{icon}</div>
      )}
      <h3 className={cn('text-lg font-semibold text-slate-800', titleClassName)}>{title}</h3>
      {description && <div className="mt-2 max-w-md text-sm text-slate-500">{description}</div>}
    </div>
  )
}
