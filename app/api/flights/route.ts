import { NextResponse } from 'next/server'
import { findFlightById, generateFlightsForSearch } from '@/lib/mock/flightGenerator'
import { paginate, FLIGHTS_PAGE_SIZE } from '@/lib/utils/pagination'
import { getSearchDateError, isValidSearchDate } from '@/lib/utils/searchDate'

const SIMULATED_DELAY_MS = 800

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')?.toUpperCase()
  const destination = searchParams.get('destination')?.toUpperCase()
  const date = searchParams.get('date')
  const simulateError = searchParams.get('simulateError') === 'true'

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS))

  if (simulateError) {
    return NextResponse.json({ error: 'Unable to fetch flights. Please try again.' }, { status: 500 })
  }

  if (!origin || !destination || !date) {
    return NextResponse.json({ error: 'Missing required parameters: origin, destination, date' }, { status: 400 })
  }

  if (origin === destination) {
    return NextResponse.json({ error: 'Origin and destination must be different' }, { status: 400 })
  }

  if (!isValidSearchDate(date)) {
    return NextResponse.json({ error: getSearchDateError(date) }, { status: 400 })
  }

  const passengers = Math.max(1, Number(searchParams.get('passengers') ?? 1))
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(20, Math.max(1, Number(searchParams.get('limit') ?? FLIGHTS_PAGE_SIZE)))

  const allResults = generateFlightsForSearch(origin, destination, date).filter(
    (flight) => flight.availableSeats >= passengers,
  )

  const { items: results, hasMore, total } = paginate(allResults, page, limit)

  const airlines = [...new Set(allResults.map((f) => f.airline))].sort()
  const priceRange =
    allResults.length > 0
      ? { min: Math.min(...allResults.map((f) => f.price)), max: Math.max(...allResults.map((f) => f.price)) }
      : { min: 0, max: 0 }

  return NextResponse.json({
    flights: results,
    meta: {
      total,
      page,
      limit,
      hasMore,
      origin,
      destination,
      date,
      passengers,
      airlines,
      priceRange,
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { flightId, passenger } = body

  await new Promise((resolve) => setTimeout(resolve, 600))

  if (!flightId || !passenger?.firstName || !passenger?.lastName || !passenger?.email) {
    return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 })
  }

  const flight = findFlightById(flightId)
  if (!flight) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
  }

  const bookingReference = `SKY${Date.now().toString(36).toUpperCase().slice(-6)}`

  return NextResponse.json({
    bookingReference,
    flight,
    passenger,
    bookedAt: new Date().toISOString(),
    status: 'confirmed',
  })
}
