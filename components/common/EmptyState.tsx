'use client'

import type { ReactNode } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { StatusPanel } from './StatusPanel'

const EMPTY_ANIMATION_SRC = '/animations/Empty.lottie'

interface EmptyStateProps {
  title: string
  description?: ReactNode
  testId?: string
}

export function EmptyState({ title, description, testId = 'empty-state' }: EmptyStateProps) {
  return (
    <StatusPanel
      card={false}
      iconRing={false}
      icon={<DotLottieReact src={EMPTY_ANIMATION_SRC} loop autoplay className="h-64 w-64" aria-label="No results" />}
      title={title}
      description={description}
      testId={testId}
    />
  )
}
