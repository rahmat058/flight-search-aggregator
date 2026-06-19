'use client'

import { cn } from '@/utils/twMerge'
import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { getAirportLabel } from '@/data/airports'
import type { Flight } from '@/lib/types/flight'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { clearSelectedFlight } from '@/lib/store/slices/bookingSlice'
import { BookingReviewDetails } from './BookingReviewDetails'
import { ArrowRight, ClipboardCheck, X } from 'lucide-react'

const SIDEBAR_TRANSITION_MS = 300

type SidebarPhase = 'closed' | 'entering' | 'open' | 'exiting'

interface SidebarAnimState {
  phase: SidebarPhase
  flight: Flight | null
}

interface FlightBookingSidebarProps {
  open: boolean
  onClose: () => void
}

export function FlightBookingSidebar({ open, onClose }: FlightBookingSidebarProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedFlight } = useAppSelector((state) => state.booking)
  const { params } = useAppSelector((state) => state.search)

  const [animState, setAnimState] = useState<SidebarAnimState>({ phase: 'closed', flight: null })
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)

    if (open && selectedFlight) {
      setAnimState({ phase: 'entering', flight: selectedFlight })
    } else if (!open && animState.phase !== 'closed' && animState.phase !== 'exiting') {
      setAnimState((current) => ({ ...current, phase: 'exiting' }))
    }
  }

  useLayoutEffect(() => {
    if (animState.phase !== 'entering') return

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimState((current) => (current.phase === 'entering' ? { ...current, phase: 'open' } : current))
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [animState.phase])

  useEffect(() => {
    if (animState.phase !== 'exiting') return

    const timer = window.setTimeout(() => {
      setAnimState({ phase: 'closed', flight: null })
      dispatch(clearSelectedFlight())
    }, SIDEBAR_TRANSITION_MS)

    return () => window.clearTimeout(timer)
  }, [animState.phase, dispatch])

  useEffect(() => {
    if (animState.phase === 'closed') return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [animState.phase, onClose])

  const { phase, flight } = animState
  const isMounted = phase !== 'closed'
  const isPanelOpen = phase === 'open'
  const isBackdropVisible = phase === 'open' || phase === 'entering'

  if (!isMounted || !flight || typeof document === 'undefined') return null

  const passengers = params.passengers || 1

  const handleClose = () => {
    onClose()
  }

  const handleContinue = () => {
    onClose()
    router.push(`/flights/${flight.id}/book`)
  }

  return createPortal(
    <div className="fixed inset-0 z-10000" data-testid="booking-review-sidebar">
      <button
        type="button"
        aria-label="Close booking details"
        className={cn(
          'absolute inset-0 bg-slate-900/40 transition-opacity duration-500 ease-out',
          isBackdropVisible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={handleClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-sidebar-title"
        className={cn(
          'absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-indigo-100/80 bg-white/95 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl',
          'transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        data-testid="booking-review">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="booking-sidebar-title" className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <ClipboardCheck className="h-5 w-5 text-indigo-500" />
              Review your flight
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {getAirportLabel(params.origin)} → {getAirportLabel(params.destination)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-4 text-sm text-slate-500">Please confirm the details before proceeding to booking.</p>
          <BookingReviewDetails flight={flight} passengers={passengers} />
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <Button className="w-full" onClick={handleContinue} data-testid="proceed-booking-btn">
            Continue to booking
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
