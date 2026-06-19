'use client'

import { FormEvent } from 'react'
import { AIRPORTS } from '@/data/airports'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { resetFilters } from '@/lib/store/slices/filtersSlice'
import { resetBookingFlow } from '@/lib/store/slices/bookingSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { searchFlights, updateSearchParams } from '@/lib/store/slices/searchSlice'
import { getMaxSearchDate, getMinSearchDate } from '@/lib/utils/searchDate'
import { ArrowUpDown, CalendarDays, MapPin, Plane, Search, Users } from 'lucide-react'

const airportOptions = AIRPORTS.map((a) => ({
  value: a.code,
  label: `${a.city} (${a.code})`,
}))

export function SearchForm() {
  const dispatch = useAppDispatch()
  const { params, status } = useAppSelector((state) => state.search)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(resetFilters())
    dispatch(resetBookingFlow())
    dispatch(searchFlights(params))
  }

  const swapAirports = () => {
    dispatch(
      updateSearchParams({
        origin: params.destination,
        destination: params.origin,
      }),
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card animate-fade-in p-6 sm:p-8" data-testid="search-form">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-800">
        <Plane className="h-6 w-6 text-indigo-500" />
        Find your next flight
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-3">
          <Select
            label="From"
            icon={<MapPin className="h-4 w-4 text-indigo-500" />}
            value={params.origin}
            options={airportOptions}
            onChange={(e) => dispatch(updateSearchParams({ origin: e.target.value }))}
            data-testid="origin-select"
          />
        </div>

        <div className="flex items-end justify-center lg:col-span-1">
          <button
            type="button"
            onClick={swapAirports}
            className="mb-0.5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-indigo-200 bg-white/80 text-indigo-500 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            aria-label="Swap origin and destination">
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <div className="lg:col-span-3">
          <Select
            label="To"
            icon={<MapPin className="h-4 w-4 text-violet-500" />}
            value={params.destination}
            options={airportOptions}
            onChange={(e) => dispatch(updateSearchParams({ destination: e.target.value }))}
            data-testid="destination-select"
          />
        </div>

        <div className="lg:col-span-2">
          <Input
            label="Departure date"
            icon={<CalendarDays className="pointer-events-none h-4 w-4" />}
            type="date"
            value={params.date}
            min={getMinSearchDate()}
            max={getMaxSearchDate()}
            onChange={(e) => dispatch(updateSearchParams({ date: e.target.value }))}
            data-testid="date-input"
          />
        </div>

        <div className="lg:col-span-2">
          <Select
            label="Passengers"
            icon={<Users className="h-4 w-4" />}
            value={String(params.passengers)}
            options={[1, 2, 3, 4, 5, 6].map((n) => ({
              value: String(n),
              label: `${n} ${n === 1 ? 'passenger' : 'passengers'}`,
            }))}
            onChange={(e) => dispatch(updateSearchParams({ passengers: Number(e.target.value) }))}
            data-testid="passengers-select"
          />
        </div>

        <div className="lg:col-span-1">
          <Button type="submit" size="lg" loading={status === 'loading'} className="w-full" data-testid="search-btn">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  )
}
