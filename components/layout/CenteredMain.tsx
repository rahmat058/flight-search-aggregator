import type { ReactNode } from 'react'
import { cn } from '@/utils/twMerge'

interface CenteredMainProps {
  children: ReactNode
  align?: 'center' | 'start'
  className?: string
}

export function CenteredMain({ children, align = 'center', className }: CenteredMainProps) {
  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6',
        align === 'center' ? 'items-center justify-center' : 'items-start justify-start',
        className,
      )}>
      {children}
    </main>
  )
}
