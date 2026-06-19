'use client'

import { cn } from '@/utils/twMerge'
import { useMemo } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  setMaxPrice,
  setMaxStops,
  toggleAirline,
  setDepartureWindow,
  resetFilters,
} from '@/lib/store/slices/filtersSlice'
import { filterFlights } from '@/lib/utils/flightHelpers'
import { getFilterSidebarSummary, hasActiveFilters } from '@/lib/utils/flightResultsSummary'
import { Banknote, Building2, Clock, CloudMoon, RotateCcw, SlidersHorizontal, Sun, Sunrise, Sunset } from 'lucide-react'

const departureWindows = [
  { value: 'any', label: 'Any time', timeRange: 'All departures', icon: Clock },
  { value: 'early-morning', label: 'Early Morning', timeRange: '00:00 – 04:59', icon: CloudMoon },
  { value: 'morning', label: 'Morning', timeRange: '05:00 – 11:59', icon: Sunrise },
  { value: 'afternoon', label: 'Afternoon', timeRange: '12:00 – 17:59', icon: Sun },
  { value: 'evening', label: 'Evening', timeRange: '18:00 – 23:59', icon: Sunset },
] as const

const filterChipClasses = (active: boolean) =>
  cn(
    'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
    active ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25' : 'bg-white/70 text-slate-600 hover:bg-white',
  )

const sectionLabelClasses = 'mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600'
const sectionIconClasses = 'h-4 w-4 shrink-0 text-indigo-500'

export function FlightFilters() {
  const dispatch = useAppDispatch()
  const { filters } = useAppSelector((state) => state.filters)
  const { flights, meta } = useAppSelector((state) => state.search)

  const filteredFlights = useMemo(() => filterFlights(flights, filters), [flights, filters])

  if (!meta) return null

  const { airlines, priceRange } = meta
  const filtersActive = hasActiveFilters(filters, priceRange.max)
  const sidebarSummary = getFilterSidebarSummary({
    displayed: filteredFlights.length,
    loaded: flights.length,
    total: meta.total,
    filtersActive,
  })

  return (
    <aside className="glass-card p-5" data-testid="flight-filters">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-base font-semibold text-slate-800">
          <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
          Filters
        </h3>
        <button
          type="button"
          onClick={() => dispatch(resetFilters())}
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <p className="mb-4 text-xs text-slate-500" data-testid="filter-summary">
        {sidebarSummary}
      </p>

      <div className="space-y-4">
        <div>
          <label className={sectionLabelClasses}>
            <Banknote className={sectionIconClasses} />
            Max price: {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
          </label>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={10}
            value={filters.maxPrice ?? priceRange.max}
            onChange={(e) => dispatch(setMaxPrice(Number(e.target.value)))}
            className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed"
            data-testid="price-filter"
          />
          <div className="mt-1 flex justify-between text-sm text-slate-400">
            <span>${priceRange.min}</span>
            <span>${priceRange.max}</span>
          </div>
        </div>

        <div>
          <p className={sectionLabelClasses}>Stops</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: null, label: 'Any' },
              { value: 0, label: 'Nonstop' },
              { value: 1, label: '1 stop max' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => dispatch(setMaxStops(opt.value))}
                className={filterChipClasses(filters.maxStops === opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={sectionLabelClasses}>Departure time</p>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Departure time">
            {departureWindows.map((opt) => {
              const Icon = opt.icon
              const active = filters.departureWindow === opt.value
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all',
                    active
                      ? 'border-indigo-300 bg-indigo-50 shadow-sm shadow-indigo-500/10'
                      : 'border-slate-100 bg-white/70 hover:border-indigo-200 hover:bg-white',
                  )}>
                  <input
                    type="radio"
                    name="departure-window"
                    value={opt.value}
                    checked={active}
                    onChange={() => dispatch(setDepartureWindow(opt.value))}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                      active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500',
                    )}>
                    <Icon className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                    <span className="block text-xs text-slate-500">{opt.timeRange}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {airlines.length > 0 && (
          <div>
            <p className={sectionLabelClasses}>
              <Building2 className={sectionIconClasses} />
              Airlines
            </p>
            <div className="flex flex-col gap-2">
              {airlines.map((airline) => (
                <Checkbox
                  key={airline}
                  size="md"
                  className="flex w-full"
                  id={`airline-${airline.replace(/\s+/g, '-').toLowerCase()}`}
                  label={airline}
                  checked={filters.airlines.includes(airline)}
                  onChange={() => dispatch(toggleAirline(airline))}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
