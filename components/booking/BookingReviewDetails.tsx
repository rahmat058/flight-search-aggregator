'use client'

import type { Flight } from '@/lib/types/flight'
import { getAirportLabel } from '@/data/airports'
import { formatDate, formatDuration, formatPrice, formatTime, getStopsLabel } from '@/lib/utils/flightHelpers'

interface BookingReviewDetailsProps {
  flight: Flight
  passengers: number
}

export function BookingReviewDetails({ flight, passengers }: BookingReviewDetailsProps) {
  const totalPrice = flight.price * passengers

  return (
    <>
      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">{flight.airline}</p>
            <p className="text-sm text-slate-500">{flight.flightNumber}</p>
          </div>
          <span className="rounded-lg bg-white px-3 py-1 text-sm text-indigo-600 capitalize shadow-sm">
            {flight.cabinClass}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs tracking-wide text-slate-400 uppercase">Departure</p>
            <p className="text-lg font-bold text-slate-800">{formatTime(flight.departureTime)}</p>
            <p className="text-sm text-slate-600">{getAirportLabel(flight.origin)}</p>
            <p className="text-xs text-slate-400">{formatDate(flight.departureTime)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">{formatDuration(flight.duration)}</p>
            <div className="my-2 h-px bg-indigo-200" />
            <p className="text-sm font-medium text-teal-600">{getStopsLabel(flight.stops)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs tracking-wide text-slate-400 uppercase">Arrival</p>
            <p className="text-lg font-bold text-slate-800">{formatTime(flight.arrivalTime)}</p>
            <p className="text-sm text-slate-600">{getAirportLabel(flight.destination)}</p>
            <p className="text-xs text-slate-400">{formatDate(flight.arrivalTime)}</p>
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
          <span className="font-medium text-slate-800">{formatPrice(flight.price)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3">
          <span className="font-semibold text-slate-800">Total</span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-bold text-transparent">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </>
  )
}
