'use client'

import type { Flight } from '@/lib/types/flight'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Clock, Plane, Users } from 'lucide-react'
import { formatDuration, formatPrice, formatTime, getStopsLabel } from '@/lib/utils/flightHelpers'

interface FlightCardProps {
  flight: Flight
  passengers: number
  onSelect: (flight: Flight) => void
}

export function FlightCard({ flight, passengers, onSelect }: FlightCardProps) {
  const totalPrice = flight.price * passengers

  return (
    <article
      className="group glass-card flex flex-col gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/10 sm:flex-row sm:items-center sm:justify-between"
      data-testid="flight-card">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-100 to-violet-100">
          <Plane className="h-5 w-5 text-indigo-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800">{flight.airline}</p>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{flight.flightNumber}</span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 capitalize">
              {flight.cabinClass}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{formatTime(flight.departureTime)}</p>
              <p className="text-xs text-slate-500">{flight.origin}</p>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {formatDuration(flight.duration)}
              </p>
              <div className="relative flex w-full items-center">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-indigo-300 to-transparent" />
                <Plane className="mx-1 h-3 w-3 rotate-90 text-indigo-400" />
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-indigo-300 to-transparent" />
              </div>
              <p className="text-xs font-medium text-teal-600">{getStopsLabel(flight.stops)}</p>
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{formatTime(flight.arrivalTime)}</p>
              <p className="text-xs text-slate-500">{flight.destination}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:min-w-38 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
        <div className="space-y-1 text-right">
          <p className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent">
            {formatPrice(totalPrice)}
          </p>
          {passengers > 1 && (
            <p className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
              <span>{formatPrice(flight.price)}</span>
              <span aria-hidden className="text-[10px] leading-none text-slate-300">
                ×
              </span>
              <span>{passengers} passengers</span>
            </p>
          )}
          <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
            <Users className="h-3 w-3 shrink-0" />
            {flight.availableSeats} seats left
          </p>
        </div>
        <Button size="sm" onClick={() => onSelect(flight)} data-testid="select-flight-btn">
          Select
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  )
}
