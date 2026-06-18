import type { Airport } from '@/lib/types/flight'

export const AIRPORTS: Airport[] = [
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International" },
  { code: 'MIA', city: 'Miami', name: 'Miami International' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International' },
  { code: 'BOS', city: 'Boston', name: 'Logan International' },
]

export const getAirportLabel = (code: string) => {
  const airport = AIRPORTS.find((a) => a.code === code)
  return airport ? `${airport.city} (${airport.code})` : code
}
