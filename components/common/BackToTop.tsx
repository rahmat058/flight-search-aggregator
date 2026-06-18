'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp } from 'lucide-react'

interface BackToTopProps {
  showAfter?: number
}

export function BackToTop({ showAfter = 320 }: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > showAfter)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [showAfter])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return createPortal(
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      data-testid="back-to-top-btn"
      className="fixed right-6 bottom-6 z-[9999] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/45 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:outline-none sm:right-8 sm:bottom-8">
      <ArrowUp className="h-5 w-5" />
    </button>,
    document.body,
  )
}
