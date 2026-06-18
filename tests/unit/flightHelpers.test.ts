import { describe, it, expect } from 'vitest'
import {
  filterFlights,
  sortFlights,
  formatDuration,
  formatPrice,
  validateEmail,
  validatePhone,
  getStopsLabel,
} from '@/lib/utils/flightHelpers'
import type { Flight, FlightFilters } from '@/lib/types/flight'

const mockFlight = (overrides: Partial<Flight> = {}): Flight => ({
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
  ...overrides,
})

describe('flightHelpers', () => {
  describe('formatDuration', () => {
    it('formats hours and minutes', () => {
      expect(formatDuration(360)).toBe('6h')
      expect(formatDuration(375)).toBe('6h 15m')
    })
  })

  describe('formatPrice', () => {
    it('formats USD currency', () => {
      expect(formatPrice(300)).toBe('$300.00')
    })
  })

  describe('getStopsLabel', () => {
    it('returns correct labels', () => {
      expect(getStopsLabel(0)).toBe('Nonstop')
      expect(getStopsLabel(1)).toBe('1 stop')
      expect(getStopsLabel(2)).toBe('2 stops')
    })
  })

  describe('validateEmail', () => {
    it('validates email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('validates phone numbers', () => {
      expect(validatePhone('+1 (555) 123-4567')).toBe(true)
      expect(validatePhone('123')).toBe(false)
    })
  })

  describe('filterFlights', () => {
    const flights = [
      mockFlight({ id: '1', price: 200, stops: 0, airline: 'Delta Air Lines', departureTime: '2026-07-15T08:00:00.000Z' }),
      mockFlight({ id: '2', price: 400, stops: 1, airline: 'United Airlines', departureTime: '2026-07-15T14:00:00.000Z' }),
      mockFlight({ id: '3', price: 600, stops: 2, airline: 'JetBlue Airways', departureTime: '2026-07-15T20:00:00.000Z' }),
    ]

    it('filters by max price', () => {
      const filters: FlightFilters = { maxPrice: 350, maxStops: null, airlines: [], departureWindow: 'any' }
      expect(filterFlights(flights, filters)).toHaveLength(1)
    })

    it('filters by max stops', () => {
      const filters: FlightFilters = { maxPrice: null, maxStops: 0, airlines: [], departureWindow: 'any' }
      expect(filterFlights(flights, filters)).toHaveLength(1)
    })

    it('filters by airline', () => {
      const filters: FlightFilters = { maxPrice: null, maxStops: null, airlines: ['United Airlines'], departureWindow: 'any' }
      expect(filterFlights(flights, filters)).toHaveLength(1)
    })

    it('filters by morning departure window', () => {
      const filters: FlightFilters = { maxPrice: null, maxStops: null, airlines: [], departureWindow: 'morning' }
      expect(filterFlights(flights, filters)).toHaveLength(1)
    })
  })

  describe('sortFlights', () => {
    const flights = [
      mockFlight({ id: '1', price: 400, duration: 300, departureTime: '2026-07-15T14:00:00.000Z' }),
      mockFlight({ id: '2', price: 200, duration: 500, departureTime: '2026-07-15T08:00:00.000Z' }),
      mockFlight({ id: '3', price: 300, duration: 400, departureTime: '2026-07-15T20:00:00.000Z' }),
    ]

    it('sorts by price ascending', () => {
      const sorted = sortFlights(flights, 'price-asc')
      expect(sorted.map((f) => f.price)).toEqual([200, 300, 400])
    })

    it('sorts by duration ascending', () => {
      const sorted = sortFlights(flights, 'duration-asc')
      expect(sorted.map((f) => f.duration)).toEqual([300, 400, 500])
    })

    it('sorts by departure ascending', () => {
      const sorted = sortFlights(flights, 'departure-asc')
      expect(sorted.map((f) => f.id)).toEqual(['2', '1', '3'])
    })
  })
})
