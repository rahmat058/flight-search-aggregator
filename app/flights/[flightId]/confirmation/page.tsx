import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { FlightBookingGate } from '@/components/booking/FlightBookingGate'

export default function BookingConfirmationPage() {
  return (
    <FlightBookingGate requireBooking>
      <BookingConfirmation />
    </FlightBookingGate>
  )
}
