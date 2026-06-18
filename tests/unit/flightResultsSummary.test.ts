import { describe, it, expect } from 'vitest'
import {
  getFilterSidebarSummary,
  getPaginationSummary,
  getResultsHeadline,
  hasActiveFilters,
} from '@/lib/utils/flightResultsSummary'
import type { FlightFilters } from '@/lib/types/flight'

const defaultFilters: FlightFilters = {
  maxPrice: null,
  maxStops: null,
  airlines: [],
  departureWindow: 'any',
}

describe('flightResultsSummary', () => {
  it('detects active filters', () => {
    expect(hasActiveFilters(defaultFilters, 700)).toBe(false)
    expect(hasActiveFilters({ ...defaultFilters, departureWindow: 'evening' }, 700)).toBe(true)
  })

  it('formats filtered headline and pagination consistently', () => {
    const counts = {
      displayed: 4,
      loaded: 18,
      total: 18,
      hasMore: false,
      filtersActive: true,
    }

    expect(getResultsHeadline(counts)).toBe('4 matching · 18 of 18 loaded')
    expect(getPaginationSummary(counts)).toBe('4 flights match your filters · 18 of 18 loaded')
    expect(getFilterSidebarSummary(counts)).toBe('4 of 18 loaded flights match your filters')
  })

  it('formats paginated unfiltered summary', () => {
    const counts = {
      displayed: 3,
      loaded: 3,
      total: 18,
      hasMore: true,
      filtersActive: false,
    }

    expect(getResultsHeadline(counts)).toBe('3 of 18 flights · 3 loaded')
    expect(getPaginationSummary(counts)).toBe('Showing 3 of 18 loaded')
  })
})
