import { AIRPORTS } from '@/data/airports'
import type { CabinClass, Flight } from '@/lib/types/flight'
import { departureMatchesDate, isValidSearchDate } from '@/lib/utils/searchDate'

export const MOCK_FLIGHT_COUNT = 1000

const AIRLINES = [
  { name: 'Delta Air Lines', code: 'DL' },
  { name: 'United Airlines', code: 'UA' },
  { name: 'American Airlines', code: 'AA' },
  { name: 'JetBlue Airways', code: 'B6' },
  { name: 'Southwest Airlines', code: 'WN' },
  { name: 'Alaska Airlines', code: 'AS' },
  { name: 'Spirit Airlines', code: 'NK' },
  { name: 'Frontier Airlines', code: 'F9' },
] as const

const CABIN_CLASSES: CabinClass[] = ['economy', 'premium', 'business']
const SEAT_OPTIONS = [8, 12, 18, 24, 30, 6]
const STOP_OPTIONS = [0, 0, 0, 1, 1, 2] as const
const CANONICAL_DATE = '2026-07-15'

/** Primary demo route — assignment requires 30+ flights on at least one route */
export const DEMO_ROUTE_MIN_FLIGHTS = 30
const DEMO_ROUTE = { origin: 'JFK', destination: 'LAX' } as const
/** Routes intentionally empty for demo / E2E empty-state coverage */
const EMPTY_ROUTE_KEYS = new Set(['SEA-MIA-2026-07-15'])

const airportCity = Object.fromEntries(AIRPORTS.map((a) => [a.code, a.city]))

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

const routeKey = (origin: string, destination: string, date: string) => `${origin}-${destination}-${date}`

const estimateDuration = (origin: string, destination: string) => {
  const seed = hashString(`${origin}-${destination}`)
  return 180 + (seed % 420)
}

const pickStopCities = (origin: string, destination: string, stops: number, seed: number) => {
  if (stops === 0) return [] as string[]

  const hubs = AIRPORTS.map((a) => a.code).filter((code) => code !== origin && code !== destination)
  const cities: string[] = []

  for (let i = 0; i < stops; i++) {
    cities.push(hubs[(seed + i * 3) % hubs.length])
  }

  return cities
}

export const buildFlightId = (origin: string, destination: string, date: string, index: number) =>
  `flt-${origin}-${destination}-${date.replace(/-/g, '')}-${String(index).padStart(2, '0')}`

export const parseFlightId = (id: string) => {
  const match = id.match(/^flt-([A-Z]{3})-([A-Z]{3})-(\d{8})-(\d{2})$/)
  if (!match) return null

  const [, origin, destination, compactDate, index] = match
  const date = `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`

  return {
    origin,
    destination,
    date,
    index: Number(index),
  }
}

const shiftIsoDate = (iso: string, fromDate: string, toDate: string) => {
  const time = iso.slice(fromDate.length)
  return `${toDate}${time}`
}

const isFlightScheduledOnDate = (flight: Flight, date: string): boolean => {
  if (date === CANONICAL_DATE) return true

  const parsed = parseFlightId(flight.id)
  if (!parsed) return false

  const seed = hashString(`${parsed.origin}-${parsed.destination}-${date}-${parsed.index}`)
  return seed % 3 !== 0
}

export const applySearchDate = (flight: Flight, date: string): Flight => {
  const parsed = parseFlightId(flight.id)
  const index = parsed?.index ?? 0

  return {
    ...flight,
    id: buildFlightId(flight.origin, flight.destination, date, index),
    departureTime: shiftIsoDate(flight.departureTime, CANONICAL_DATE, date),
    arrivalTime: shiftIsoDate(flight.arrivalTime, CANONICAL_DATE, date),
  }
}

const createTemplateFlight = (origin: string, destination: string, index: number, routeSeed: number): Flight => {
  const seed = routeSeed + index
  const airline = AIRLINES[(seed + index) % AIRLINES.length]
  const stops = STOP_OPTIONS[(seed + index) % STOP_OPTIONS.length]
  const stopCities = pickStopCities(origin, destination, stops, seed + index)
  const layoverMinutes = stops * (45 + ((seed + index) % 40))
  const duration = estimateDuration(origin, destination) + layoverMinutes
  const departureHour = 6 + ((seed + index * 2) % 14)
  const departureMinute = (seed + index * 13) % 60
  const departure = new Date(`${CANONICAL_DATE}T00:00:00.000Z`)
  departure.setUTCHours(departureHour, departureMinute, 0, 0)
  const arrival = new Date(departure.getTime() + duration * 60_000)
  const cabinClass = CABIN_CLASSES[(seed + index) % CABIN_CLASSES.length]
  const priceBase =
    180 + (seed % 120) + index * 25 + stops * 40 + (cabinClass === 'business' ? 120 : cabinClass === 'premium' ? 60 : 0)

  return {
    id: buildFlightId(origin, destination, CANONICAL_DATE, index),
    airline: airline.name,
    flightNumber: `${airline.code}${1000 + ((seed + index * 17) % 9000)}`,
    origin,
    originCity: airportCity[origin] ?? origin,
    destination,
    destinationCity: airportCity[destination] ?? destination,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    duration,
    stops,
    stopCities,
    price: priceBase,
    currency: 'USD',
    cabinClass,
    availableSeats: SEAT_OPTIONS[(seed + index) % SEAT_OPTIONS.length],
  }
}

/** Build exactly `count` template flights covering every airport pair. */
export const buildMockFlightCatalog = (count = MOCK_FLIGHT_COUNT): Flight[] => {
  const routes = AIRPORTS.flatMap((origin) =>
    AIRPORTS.filter((destination) => destination.code !== origin.code).map((destination) => ({
      origin: origin.code,
      destination: destination.code,
    })),
  )

  const otherRoutes = routes.filter(
    (route) => !(route.origin === DEMO_ROUTE.origin && route.destination === DEMO_ROUTE.destination),
  )

  const demoAllocation = Math.min(DEMO_ROUTE_MIN_FLIGHTS, count)
  const remaining = count - demoAllocation
  const basePerRoute = Math.floor(remaining / otherRoutes.length)
  let remainder = remaining % otherRoutes.length
  const flights: Flight[] = []

  const demoSeed = hashString(`${DEMO_ROUTE.origin}-${DEMO_ROUTE.destination}-demo`)
  for (let index = 0; index < demoAllocation; index++) {
    flights.push(createTemplateFlight(DEMO_ROUTE.origin, DEMO_ROUTE.destination, index, demoSeed))
  }

  for (const [routeIndex, route] of otherRoutes.entries()) {
    const flightsForRoute = basePerRoute + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder -= 1

    const routeSeed = hashString(`${route.origin}-${route.destination}-${routeIndex}`)

    for (let index = 0; index < flightsForRoute; index++) {
      flights.push(createTemplateFlight(route.origin, route.destination, index, routeSeed))
    }
  }

  return flights.slice(0, count)
}

let catalogCache: Flight[] | null = null

export const resetMockFlightCatalogCache = () => {
  catalogCache = null
}

export const getMockFlightCatalog = () => {
  catalogCache ??= buildMockFlightCatalog()
  return catalogCache
}

export const generateFlightsForSearch = (origin: string, destination: string, date: string): Flight[] => {
  if (origin === destination) return []
  if (!isValidSearchDate(date)) return []
  if (EMPTY_ROUTE_KEYS.has(routeKey(origin, destination, date))) return []

  return getMockFlightCatalog()
    .filter((flight) => flight.origin === origin && flight.destination === destination)
    .filter((flight) => isFlightScheduledOnDate(flight, date))
    .map((flight) => applySearchDate(flight, date))
    .filter((flight) => departureMatchesDate(flight.departureTime, date))
}

export const findFlightById = (id: string): Flight | undefined => {
  const parsed = parseFlightId(id)
  if (!parsed) return undefined

  const template = getMockFlightCatalog().find((flight) => {
    const templateParts = parseFlightId(flight.id)
    return (
      templateParts?.origin === parsed.origin &&
      templateParts.destination === parsed.destination &&
      templateParts.index === parsed.index
    )
  })

  if (!template) return undefined

  return applySearchDate(template, parsed.date)
}

export const generateAllMockFlights = () => getMockFlightCatalog()
