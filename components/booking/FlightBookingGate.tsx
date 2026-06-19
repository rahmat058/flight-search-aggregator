'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { findFlightById } from '@/lib/mock/flightGenerator'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setSelectedFlight } from '@/lib/store/slices/bookingSlice'
import { isPassengerComplete } from '@/lib/utils/bookingHelpers'
import { CenteredMain } from '@/components/layout/CenteredMain'

interface FlightBookingGateProps {
  children: ReactNode
  requireBooking?: boolean
  requirePassenger?: boolean
  align?: 'center' | 'start'
}

export function FlightBookingGate({
  children,
  requireBooking = false,
  requirePassenger = false,
  align = 'center',
}: FlightBookingGateProps) {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const flightId = params.flightId as string
  const { selectedFlight, booking, passenger } = useAppSelector((state) => state.booking)
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

        if (isPassengerComplete(passenger)) {
          router.replace(`/flights/${flightId}/payment`)
        } else {
          router.replace(`/flights/${flightId}/book`)
        }
        return
      }

      setReady(true)
      return
    }

    if (requirePassenger && !isPassengerComplete(passenger)) {
      router.replace(`/flights/${flightId}/book`)
      return
    }

    if (selectedFlight?.id !== flightId) {
      dispatch(setSelectedFlight(flight))
      return
    }

    setReady(true)
  }, [dispatch, flightId, requireBooking, requirePassenger, router, booking, selectedFlight, passenger])

  if (!ready || !selectedFlight || selectedFlight.id !== flightId) {
    return (
      <CenteredMain>
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" aria-label="Loading flight" />
      </CenteredMain>
    )
  }

  return <CenteredMain align={align}>{children}</CenteredMain>
}
