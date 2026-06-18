'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { getAirportLabel } from '@/data/airports'
import { ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { clearSelectedFlight } from '@/lib/store/slices/bookingSlice'
import { formatDate, formatDuration, formatPrice, formatTime, getStopsLabel } from '@/lib/utils/flightHelpers'

export function BookingReview() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedFlight } = useAppSelector((state) => state.booking)
  const { params } = useAppSelector((state) => state.search)

  if (!selectedFlight) return null

  const passengers = params.passengers || 1
  const totalPrice = selectedFlight.price * passengers

  const handleBack = () => {
    dispatch(clearSelectedFlight())
    router.push('/')
  }

  const handleContinue = () => {
    router.push(`/flights/${selectedFlight.id}/book`)
  }

  return (
    <div className="animate-fade-in w-full max-w-2xl" data-testid="booking-review">
      <div className="glass-card p-6 sm:p-8">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-slate-800">
          <ClipboardCheck className="h-6 w-6 text-indigo-500" />
          Review your flight
        </h2>
        <p className="mb-6 text-sm text-slate-500">Please confirm the details before proceeding to booking.</p>

        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{selectedFlight.airline}</p>
              <p className="text-sm text-slate-500">{selectedFlight.flightNumber}</p>
            </div>
            <span className="rounded-lg bg-white px-3 py-1 text-sm text-indigo-600 capitalize shadow-sm">
              {selectedFlight.cabinClass}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs tracking-wide text-slate-400 uppercase">Departure</p>
              <p className="text-lg font-bold text-slate-800">{formatTime(selectedFlight.departureTime)}</p>
              <p className="text-sm text-slate-600">{getAirportLabel(selectedFlight.origin)}</p>
              <p className="text-xs text-slate-400">{formatDate(selectedFlight.departureTime)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">{formatDuration(selectedFlight.duration)}</p>
              <div className="my-2 h-px bg-indigo-200" />
              <p className="text-sm font-medium text-teal-600">{getStopsLabel(selectedFlight.stops)}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs tracking-wide text-slate-400 uppercase">Arrival</p>
              <p className="text-lg font-bold text-slate-800">{formatTime(selectedFlight.arrivalTime)}</p>
              <p className="text-sm text-slate-600">{getAirportLabel(selectedFlight.destination)}</p>
              <p className="text-xs text-slate-400">{formatDate(selectedFlight.arrivalTime)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Passengers</span>
            <span className="font-medium text-slate-800">{passengers}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Price per passenger</span>
            <span className="font-medium text-slate-800">{formatPrice(selectedFlight.price)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-800">Total</span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-bold text-transparent">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Button>
          <Button onClick={handleContinue} data-testid="proceed-booking-btn">
            Continue to booking
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
