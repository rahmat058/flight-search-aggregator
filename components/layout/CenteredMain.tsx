import type { ReactNode } from 'react'

interface CenteredMainProps {
  children: ReactNode
}

export function CenteredMain({ children }: CenteredMainProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-8 sm:px-6">
      {children}
    </main>
  )
}
