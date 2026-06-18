'use client'

import { useRouter } from 'next/navigation'
import { CircleCheck, Mail, Search, Ticket } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { resetBookingFlow } from '@/lib/store/slices/bookingSlice'
import { resetSearch } from '@/lib/store/slices/searchSlice'
import { formatDate, formatPrice, formatTime } from '@/lib/utils/flightHelpers'
import { getAirportLabel } from '@/data/airports'
import { Button } from '@/components/ui/Button'

export function BookingConfirmation() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { booking, selectedFlight } = useAppSelector((state) => state.booking)
  const { params } = useAppSelector((state) => state.search)

  if (!booking || !selectedFlight) return null

  const passengers = params.passengers || 1
  const totalPrice = selectedFlight.price * passengers

  const handleNewSearch = () => {
    router.replace('/')
    dispatch(resetBookingFlow())
    dispatch(resetSearch())
  }

  return (
    <div className="animate-fade-in w-full max-w-lg" data-testid="booking-confirmation">
      <div className="glass-card overflow-hidden p-0">
        <div className="bg-linear-to-r from-teal-400 via-cyan-500 to-indigo-500 px-6 py-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CircleCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Booking confirmed!</h2>
          <p className="mt-2 text-white/80">Your flight has been successfully booked.</p>
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          <div className="rounded-xl bg-indigo-50 p-4 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs tracking-wider text-indigo-400 uppercase">
              <Ticket className="h-3.5 w-3.5" />
              Booking reference
            </p>
            <p className="mt-1 text-2xl font-bold tracking-widest text-indigo-700" data-testid="booking-ref">
              {booking.bookingReference}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Passenger</span>
              <span className="font-medium text-slate-800">
                {booking.firstName} {booking.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{booking.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Flight</span>
              <span className="font-medium text-slate-800">
                {selectedFlight.airline} {selectedFlight.flightNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Route</span>
              <span className="font-medium text-slate-800">
                {getAirportLabel(selectedFlight.origin)} → {getAirportLabel(selectedFlight.destination)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Departure</span>
              <span className="font-medium text-slate-800">
                {formatDate(selectedFlight.departureTime)} at {formatTime(selectedFlight.departureTime)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-800">Total paid</span>
              <span className="font-bold text-indigo-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <Mail className="h-3.5 w-3.5" />A confirmation email has been sent to {booking.email}
          </p>

          <Button className="w-full" onClick={handleNewSearch} data-testid="new-search-btn">
            <Search className="h-4 w-4" />
            Search for another flight
          </Button>
        </div>
      </div>
    </div>
  )
}
