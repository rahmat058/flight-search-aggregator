import { BookingReview } from '@/components/booking/BookingReview'
import { FlightBookingGate } from '@/components/booking/FlightBookingGate'

export default function ReviewFlightPage() {
  return (
    <FlightBookingGate>
      <BookingReview />
    </FlightBookingGate>
  )
}
