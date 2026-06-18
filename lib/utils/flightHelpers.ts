import type { Flight, FlightFilters, SortOption } from '@/lib/types/flight'

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export const formatTime = (isoString: string): string =>
  new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

export const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const formatPrice = (price: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)

export const getDepartureHour = (isoString: string): number => new Date(isoString).getUTCHours()

export const matchesDepartureWindow = (isoString: string, window: FlightFilters['departureWindow']): boolean => {
  if (window === 'any') return true
  const hour = getDepartureHour(isoString)
  if (window === 'morning') return hour >= 5 && hour < 12
  if (window === 'afternoon') return hour >= 12 && hour < 17
  return hour >= 17 || hour < 5
}

export const filterFlights = (flights: Flight[], filters: FlightFilters): Flight[] =>
  flights.filter((flight) => {
    if (filters.maxPrice !== null && flight.price > filters.maxPrice) return false
    if (filters.maxStops !== null && flight.stops > filters.maxStops) return false
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false
    if (!matchesDepartureWindow(flight.departureTime, filters.departureWindow)) return false
    return true
  })

export const sortFlights = (flights: Flight[], sortBy: SortOption): Flight[] => {
  const sorted = [...flights]
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'duration-asc':
      return sorted.sort((a, b) => a.duration - b.duration)
    case 'departure-asc':
      return sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
    case 'departure-desc':
      return sorted.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
    default:
      return sorted
  }
}

export const getStopsLabel = (stops: number): string => {
  if (stops === 0) return 'Nonstop'
  if (stops === 1) return '1 stop'
  return `${stops} stops`
}

export const generateBookingReference = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validatePhone = (phone: string): boolean => /^[\d\s\-+()]{10,}$/.test(phone.trim())
