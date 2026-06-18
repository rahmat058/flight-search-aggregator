'use client'

import { useMemo } from 'react'
import { FilterX } from 'lucide-react'
import { FlightCard } from './FlightCard'
import { FlightSort } from './FlightSort'
import { FlightFilters } from './FlightFilters'
import { getAirportLabel } from '@/data/airports'
import { useAppSelector } from '@/lib/store/hooks'
import { FlightResultsPagination } from './FlightResultsPagination'
import { filterFlights, sortFlights } from '@/lib/utils/flightHelpers'
import { EmptyState, ErrorState, LoadingState } from '@/components/common'
import { BackToTop } from '@/components/common/BackToTop'
import { getResultsHeadline, hasActiveFilters } from '@/lib/utils/flightResultsSummary'

export function SearchStatus() {
  const { status, error, flights, params } = useAppSelector((state) => state.search)

  if (status === 'loading') {
    return (
      <LoadingState
        title="Searching flights..."
        description={
          <>
            {getAirportLabel(params.origin)} → {getAirportLabel(params.destination)}
          </>
        }
      />
    )
  }

  if (status === 'failed') {
    return <ErrorState description={error} />
  }

  if (status === 'succeeded' && flights.length === 0) {
    return (
      <EmptyState
        title="No flights found"
        description="Try adjusting your search criteria, date, or route. Popular route: New York (JFK) → Los Angeles (LAX) on July 15, 2026."
      />
    )
  }

  return null
}

export function FlightResults() {
  const { flights, status, params, meta } = useAppSelector((state) => state.search)
  const { filters, sortBy } = useAppSelector((state) => state.filters)

  const displayedFlights = useMemo(
    () => sortFlights(filterFlights(flights, filters), sortBy),
    [flights, filters, sortBy],
  )

  const filtersActive = hasActiveFilters(filters, meta?.priceRange.max ?? 0)
  const resultCounts = {
    displayed: displayedFlights.length,
    loaded: flights.length,
    total: meta?.total ?? flights.length,
    hasMore: Boolean(meta?.hasMore),
    filtersActive,
  }

  if (status !== 'succeeded') {
    return <SearchStatus />
  }

  if (flights.length === 0) {
    return <SearchStatus />
  }

  return (
    <div className="animate-fade-in space-y-6" data-testid="flight-results">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{getResultsHeadline(resultCounts)}</h2>
          <p className="text-sm text-slate-500">
            {getAirportLabel(params.origin)} → {getAirportLabel(params.destination)} · {params.date} ·{' '}
            {params.passengers} {params.passengers === 1 ? 'passenger' : 'passengers'}
          </p>
        </div>
        <FlightSort />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <FlightFilters />
        </div>
        <div className="space-y-4 lg:col-span-3">
          {displayedFlights.length === 0 ? (
            <div className="glass-card flex flex-col items-center py-12 text-center" data-testid="filtered-empty">
              <FilterX className="mb-3 h-10 w-10 text-slate-400" />
              <p className="text-slate-600">No flights match your filters.</p>
              <p className="mt-1 text-sm text-slate-400">Try adjusting your filter criteria.</p>
            </div>
          ) : (
            <>
              {displayedFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} passengers={params.passengers} />
              ))}
              <FlightResultsPagination displayedCount={displayedFlights.length} />
            </>
          )}
        </div>
      </div>

      {/* Back to top button */}
      <BackToTop />
    </div>
  )
}
