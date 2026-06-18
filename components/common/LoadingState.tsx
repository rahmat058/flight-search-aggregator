import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { StatusPanel } from './StatusPanel'

interface LoadingStateProps {
  title: string
  description?: ReactNode
  testId?: string
}

export function LoadingState({ title, description, testId = 'loading-state' }: LoadingStateProps) {
  return (
    <StatusPanel
      card={false}
      iconRing={false}
      icon={<Loader2 className="h-12 w-12 animate-spin text-indigo-500" />}
      title={title}
      description={description}
      titleClassName="font-medium text-slate-600"
      testId={testId}
    />
  )
}
