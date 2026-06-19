'use client'

import type { Flight } from '@/lib/types/flight'
import { Plane } from 'lucide-react'
import { formatDuration, formatPrice, formatTime, getStopsLabel } from '@/lib/utils/flightHelpers'

interface BookingFlightSummaryProps {
  flight: Flight
  passengers: number
}

const formatCompactDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

export function BookingFlightSummary({ flight, passengers }: BookingFlightSummaryProps) {
  const totalPrice = flight.price * passengers

  return (
    <div className="glass-card p-5" data-testid="booking-flight-summary">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-100 to-violet-100">
          <Plane className="h-4 w-4 text-indigo-600" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">{flight.airline}</p>
          <p className="text-xs text-slate-500">
            {flight.flightNumber} · <span className="capitalize">{flight.cabinClass}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">
            {flight.origin} {formatTime(flight.departureTime)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatCompactDate(flight.departureTime)}</p>
          <p className="text-xs text-slate-500">{flight.originCity}</p>
        </div>

        <div className="flex min-w-24 flex-col items-center pt-1">
          <p className="text-xs font-medium text-slate-500">{formatDuration(flight.duration)}</p>
          <div className="relative my-2 flex w-full items-center">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            <div className="mx-1 h-px flex-1 bg-indigo-200" />
            <Plane className="h-3 w-3 text-indigo-400" />
            <div className="mx-1 h-px flex-1 bg-indigo-200" />
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
          </div>
          <p className="text-xs font-medium text-teal-600">{getStopsLabel(flight.stops)}</p>
        </div>

        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm font-bold text-slate-800">
            {flight.destination} {formatTime(flight.arrivalTime)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatCompactDate(flight.arrivalTime)}</p>
          <p className="text-xs text-slate-500">{flight.destinationCity}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Passengers</span>
          <span className="font-medium text-slate-800">{passengers}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Total price</span>
          <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text font-bold text-transparent">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  )
}
