import type { FlightFilters } from '@/lib/types/flight'

export interface FlightResultsCounts {
  displayed: number
  loaded: number
  total: number
  hasMore: boolean
  filtersActive: boolean
}

export const hasActiveFilters = (filters: FlightFilters, priceRangeMax: number): boolean =>
  (filters.maxPrice !== null && filters.maxPrice < priceRangeMax) ||
  filters.maxStops !== null ||
  filters.airlines.length > 0 ||
  filters.departureWindow !== 'any'

export const getResultsHeadline = ({
  displayed,
  loaded,
  total,
  hasMore,
  filtersActive,
}: FlightResultsCounts): string => {
  if (filtersActive) {
    return `${displayed} matching · ${loaded} of ${total} loaded`
  }

  if (hasMore) {
    return `${displayed} of ${total} flights · ${loaded} loaded`
  }

  return `${displayed} of ${total} flights`
}

export const getFilterSidebarSummary = ({
  displayed,
  loaded,
  total,
  filtersActive,
}: Omit<FlightResultsCounts, 'hasMore'>): string => {
  if (filtersActive) {
    return `${displayed} of ${loaded} loaded flights match your filters`
  }

  return `${loaded} of ${total} flights loaded`
}

export const getPaginationSummary = ({
  displayed,
  loaded,
  total,
  hasMore,
  filtersActive,
}: FlightResultsCounts): string | null => {
  if (filtersActive) {
    return `${displayed} flights match your filters · ${loaded} of ${total} loaded`
  }

  if (hasMore) {
    return `Showing ${loaded} of ${total} loaded`
  }

  return null
}
