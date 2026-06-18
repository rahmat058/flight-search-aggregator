import { NextResponse } from 'next/server'
import { findFlightById } from '@/lib/mock/flightGenerator'

export async function GET(_request: Request, { params }: { params: Promise<{ flightId: string }> }) {
  const { flightId } = await params
  const flight = findFlightById(flightId)

  if (!flight) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
  }

  return NextResponse.json({ flight })
}
