'use client'

import type { ReactNode } from 'react'
import { StatusPanel } from './StatusPanel'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const LOADING_ANIMATION_SRC = '/animations/Plane.lottie'

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
      icon={<DotLottieReact src={LOADING_ANIMATION_SRC} loop autoplay className="h-80 w-80" aria-label="Loading" />}
      title={title}
      description={description}
      titleClassName="font-medium text-slate-600"
      testId={testId}
    />
  )
}
