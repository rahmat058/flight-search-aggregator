'use client'

import { useMemo, useState } from 'react'
import { FlightCard } from './FlightCard'
import { FlightSort } from './FlightSort'
import { FlightFilters } from './FlightFilters'
import { getAirportLabel } from '@/data/airports'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setSelectedFlight } from '@/lib/store/slices/bookingSlice'
import { FlightResultsPagination } from './FlightResultsPagination'
import { filterFlights, sortFlights } from '@/lib/utils/flightHelpers'
import { EmptyState, ErrorState, LoadingState } from '@/components/common'
import { BackToTop } from '@/components/common/BackToTop'
import { FlightBookingSidebar } from '@/components/booking/FlightBookingSidebar'
import { getResultsHeadline, hasActiveFilters } from '@/lib/utils/flightResultsSummary'
import type { Flight } from '@/lib/types/flight'

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
  const dispatch = useAppDispatch()
  const { flights, status, params, meta } = useAppSelector((state) => state.search)
  const { filters, sortBy } = useAppSelector((state) => state.filters)
  const [reviewSidebarOpen, setReviewSidebarOpen] = useState(false)

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

  const handleSelectFlight = (flight: Flight) => {
    dispatch(setSelectedFlight(flight))
    setReviewSidebarOpen(true)
  }

  if (status !== 'succeeded') {
    return <SearchStatus />
  }

  if (flights.length === 0) {
    return <SearchStatus />
  }

  return (
    <>
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
              <div className="glass-card" data-testid="filtered-empty">
                <EmptyState
                  title="No flights match your filters"
                  description="Try adjusting your filter criteria or reset filters to see more results."
                  testId="filtered-empty-state"
                />
              </div>
            ) : (
              <>
                {displayedFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    passengers={params.passengers}
                    onSelect={handleSelectFlight}
                  />
                ))}
                <FlightResultsPagination displayedCount={displayedFlights.length} />
              </>
            )}
          </div>
        </div>

        <BackToTop />
      </div>

      <FlightBookingSidebar open={reviewSidebarOpen} onClose={() => setReviewSidebarOpen(false)} />
    </>
  )
}
