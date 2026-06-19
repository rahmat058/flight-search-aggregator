import type { BookingPassenger } from '@/lib/types/flight'

export const isPassengerComplete = (passenger: BookingPassenger) =>
  Boolean(passenger.firstName.trim() && passenger.lastName.trim() && passenger.email.trim() && passenger.phone.trim())
