import { describe, it, expect } from 'vitest'
import searchReducer, { loadMoreFlights, searchFlights, updateSearchParams, resetSearch } from '@/lib/store/slices/searchSlice'
import filtersReducer, { setSortBy, toggleAirline, resetFilters } from '@/lib/store/slices/filtersSlice'
import bookingReducer, { setSelectedFlight, submitBooking, updatePassenger } from '@/lib/store/slices/bookingSlice'
import type { Flight } from '@/lib/types/flight'

const mockFlight: Flight = {
  id: 'flt-001',
  airline: 'Delta Air Lines',
  flightNumber: 'DL100',
  origin: 'JFK',
  originCity: 'New York',
  destination: 'LAX',
  destinationCity: 'Los Angeles',
  departureTime: '2026-07-15T10:00:00.000Z',
  arrivalTime: '2026-07-15T16:00:00.000Z',
  duration: 360,
  stops: 0,
  stopCities: [],
  price: 300,
  currency: 'USD',
  cabinClass: 'economy',
  availableSeats: 20,
}

describe('searchSlice', () => {
  it('updates search params', () => {
    const state = searchReducer(undefined, updateSearchParams({ origin: 'LAX', destination: 'JFK' }))
    expect(state.params.origin).toBe('LAX')
    expect(state.params.destination).toBe('JFK')
  })

  it('resets search state', () => {
    const modified = searchReducer(undefined, updateSearchParams({ origin: 'SFO' }))
    const reset = searchReducer(modified, resetSearch())
    expect(reset.status).toBe('idle')
    expect(reset.flights).toEqual([])
    expect(reset.loadMoreStatus).toBe('idle')
  })
})

describe('search pagination', () => {
  const mockMeta = {
    total: 9,
    page: 1,
    limit: 3,
    hasMore: true,
    origin: 'JFK',
    destination: 'LAX',
    date: '2026-07-15',
    passengers: 1,
    airlines: ['Delta Air Lines'],
    priceRange: { min: 200, max: 400 },
  }

  it('appends flights when loading more', () => {
    const initial = searchReducer(
      undefined,
      searchFlights.fulfilled(
        {
          flights: [{ id: '1' }, { id: '2' }, { id: '3' }],
          meta: mockMeta,
          params: mockMeta,
        } as never,
        '',
        undefined as never,
      ),
    )

    const next = searchReducer(
      initial,
      loadMoreFlights.fulfilled(
        {
          flights: [{ id: '4' }, { id: '5' }, { id: '6' }],
          meta: { ...mockMeta, page: 2, hasMore: true },
          params: mockMeta,
        } as never,
        '',
        undefined as never,
      ),
    )

    expect(next.flights).toHaveLength(6)
    expect(next.meta?.page).toBe(2)
  })
})

describe('filtersSlice', () => {
  it('sets sort option', () => {
    const state = filtersReducer(undefined, setSortBy('price-desc'))
    expect(state.sortBy).toBe('price-desc')
  })

  it('toggles airline filter', () => {
    let state = filtersReducer(undefined, toggleAirline('Delta Air Lines'))
    expect(state.filters.airlines).toContain('Delta Air Lines')
    state = filtersReducer(state, toggleAirline('Delta Air Lines'))
    expect(state.filters.airlines).not.toContain('Delta Air Lines')
  })

  it('resets filters', () => {
    let state = filtersReducer(undefined, setSortBy('duration-asc'))
    state = filtersReducer(state, toggleAirline('United Airlines'))
    state = filtersReducer(state, resetFilters())
    expect(state.sortBy).toBe('price-asc')
    expect(state.filters.airlines).toEqual([])
  })
})

describe('bookingSlice', () => {
  it('selects a flight', () => {
    const state = bookingReducer(undefined, setSelectedFlight(mockFlight))
    expect(state.selectedFlight).toEqual(mockFlight)
  })

  it('updates passenger info', () => {
    const state = bookingReducer(undefined, updatePassenger({ firstName: 'Jane', email: 'jane@test.com' }))
    expect(state.passenger.firstName).toBe('Jane')
    expect(state.passenger.email).toBe('jane@test.com')
  })

  it('stores booking details after successful submit', () => {
    const state = bookingReducer(
      undefined,
      submitBooking.fulfilled(
        {
          bookingReference: 'SKY123',
          flight: mockFlight,
          passenger: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '555' },
          bookedAt: '2026-07-15T12:00:00.000Z',
        },
        '',
        { flight: mockFlight, passenger: mockFlight } as never,
      ),
    )

    expect(state.booking?.bookingReference).toBe('SKY123')
    expect(state.status).toBe('succeeded')
  })
})
