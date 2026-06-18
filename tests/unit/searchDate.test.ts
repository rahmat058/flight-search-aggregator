import { describe, it, expect } from 'vitest'
import { generateFlightsForSearch } from '@/lib/mock/flightGenerator'
import { getMaxSearchDate, getMinSearchDate, isValidSearchDate } from '@/lib/utils/searchDate'

describe('searchDate', () => {
  it('rejects dates outside the searchable window', () => {
    expect(isValidSearchDate('2033-12-15')).toBe(false)
    expect(isValidSearchDate('2020-01-01')).toBe(false)
  })

  it('accepts dates within the searchable window', () => {
    expect(isValidSearchDate(getMinSearchDate())).toBe(true)
    expect(isValidSearchDate(getMaxSearchDate())).toBe(true)
  })
})

describe('generateFlightsForSearch date filtering', () => {
  it('returns no flights for invalid far-future dates', () => {
    const flights = generateFlightsForSearch('DFW', 'LAX', '2033-12-15')
    expect(flights).toEqual([])
  })

  it('returns flights only on the requested departure date', () => {
    const date = '2026-07-15'
    const flights = generateFlightsForSearch('JFK', 'LAX', date)

    expect(flights.length).toBeGreaterThanOrEqual(30)
    expect(flights.every((flight) => flight.departureTime.startsWith(date))).toBe(true)
    expect(flights.every((flight) => flight.id.includes('20260715'))).toBe(true)
  })

  it('keeps the intentional empty demo route', () => {
    const flights = generateFlightsForSearch('SEA', 'MIA', '2026-07-15')
    expect(flights).toEqual([])
  })

  it('can return a different count for a different valid date', () => {
    const canonical = generateFlightsForSearch('DFW', 'LAX', '2026-07-15')
    const otherDate = generateFlightsForSearch('DFW', 'LAX', getMaxSearchDate())

    expect(canonical.length).toBeGreaterThan(0)
    expect(otherDate.length).toBeGreaterThan(0)
    expect(otherDate.length).toBeLessThanOrEqual(canonical.length)
  })
})
