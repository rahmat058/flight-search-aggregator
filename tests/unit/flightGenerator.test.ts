import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildMockFlightCatalog,
  DEMO_ROUTE_MIN_FLIGHTS,
  generateFlightsForSearch,
  resetMockFlightCatalogCache,
} from '@/lib/mock/flightGenerator'

describe('flightGenerator mock data', () => {
  beforeEach(() => {
    resetMockFlightCatalogCache()
  })

  it('provides 30+ flights on the primary demo route with multiple airlines', () => {
    const flights = generateFlightsForSearch('JFK', 'LAX', '2026-07-15')

    expect(flights.length).toBeGreaterThanOrEqual(DEMO_ROUTE_MIN_FLIGHTS)
    expect(new Set(flights.map((flight) => flight.airline)).size).toBeGreaterThanOrEqual(4)
  })

  it('includes required flight fields on every record', () => {
    const [flight] = generateFlightsForSearch('JFK', 'LAX', '2026-07-15')

    expect(flight).toMatchObject({
      airline: expect.any(String),
      flightNumber: expect.any(String),
      origin: 'JFK',
      destination: 'LAX',
      duration: expect.any(Number),
      stops: expect.any(Number),
      price: expect.any(Number),
    })
    expect(flight.departureTime).toBeTruthy()
    expect(flight.arrivalTime).toBeTruthy()
  })

  it('builds the configured catalog size', () => {
    expect(buildMockFlightCatalog().length).toBe(1000)
  })
})
