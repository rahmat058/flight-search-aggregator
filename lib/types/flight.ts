export type CabinClass = 'economy' | 'premium' | 'business'

export type SortOption = 'price-asc' | 'price-desc' | 'duration-asc' | 'departure-asc' | 'departure-desc'

export interface Flight {
  id: string
  airline: string
  flightNumber: string
  origin: string
  originCity: string
  destination: string
  destinationCity: string
  departureTime: string
  arrivalTime: string
  duration: number
  stops: number
  stopCities: string[]
  price: number
  currency: string
  cabinClass: CabinClass
  availableSeats: number
}

export interface SearchParams {
  origin: string
  destination: string
  date: string
  passengers: number
}

export interface FlightFilters {
  maxPrice: number | null
  maxStops: number | null
  airlines: string[]
  departureWindow: 'any' | 'early-morning' | 'morning' | 'afternoon' | 'evening'
}

export interface BookingPassenger {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type PaymentMethodId = 'amex' | 'visa' | 'mastercard'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  brand: string
  cardholder: string
  last4: string
  expiry: string
}

export interface BookingDetails extends BookingPassenger {
  bookingReference: string
  bookedAt: string
  paymentMethod?: PaymentMethod
}

export interface Airport {
  code: string
  city: string
  name: string
}
