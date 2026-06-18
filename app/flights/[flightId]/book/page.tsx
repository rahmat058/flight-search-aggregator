import { BookingForm } from '@/components/booking/BookingForm'
import { FlightBookingGate } from '@/components/booking/FlightBookingGate'

export default function BookFlightPage() {
  return (
    <FlightBookingGate>
      <BookingForm />
    </FlightBookingGate>
  )
}
