import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'
import { StatusPanel } from './StatusPanel'

interface EmptyStateProps {
  title: string
  description?: ReactNode
  testId?: string
}

export function EmptyState({ title, description, testId = 'empty-state' }: EmptyStateProps) {
  return (
    <StatusPanel
      icon={<SearchX className="h-8 w-8 text-amber-500" />}
      iconRingClassName="bg-amber-100"
      title={title}
      description={description}
      testId={testId}
    />
  )
}
