'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { findFlightById } from '@/lib/mock/flightGenerator'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setSelectedFlight } from '@/lib/store/slices/bookingSlice'
import { CenteredMain } from '@/components/layout/CenteredMain'

interface FlightBookingGateProps {
  children: ReactNode
  requireBooking?: boolean
}

export function FlightBookingGate({ children, requireBooking = false }: FlightBookingGateProps) {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const flightId = params.flightId as string
  const { selectedFlight, booking } = useAppSelector((state) => state.booking)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)

    const flight = findFlightById(flightId)

    if (!flight) {
      router.replace('/')
      return
    }

    if (requireBooking) {
      if (!booking || selectedFlight?.id !== flightId) {
        if (!booking && !selectedFlight) {
          router.replace('/')
          return
        }

        router.replace(`/flights/${flightId}/review`)
        return
      }

      setReady(true)
      return
    }

    if (selectedFlight?.id !== flightId) {
      dispatch(setSelectedFlight(flight))
      return
    }

    setReady(true)
  }, [dispatch, flightId, requireBooking, router, booking, selectedFlight])

  if (!ready || !selectedFlight || selectedFlight.id !== flightId) {
    return (
      <CenteredMain>
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" aria-label="Loading flight" />
      </CenteredMain>
    )
  }

  return <CenteredMain>{children}</CenteredMain>
}
