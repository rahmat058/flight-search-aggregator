import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { StatusPanel } from './StatusPanel'

interface ErrorStateProps {
  title?: string
  description?: ReactNode
  testId?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  testId = 'error-state',
}: ErrorStateProps) {
  return (
    <StatusPanel
      icon={<AlertTriangle className="h-8 w-8 text-rose-500" />}
      iconRingClassName="bg-rose-100"
      title={title}
      description={description}
      testId={testId}
    />
  )
}
