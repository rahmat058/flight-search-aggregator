import { BookingPayment } from '@/components/booking/BookingPayment'
import { FlightBookingGate } from '@/components/booking/FlightBookingGate'

export default function PaymentFlightPage() {
  return (
    <FlightBookingGate align="start" requirePassenger>
      <BookingPayment />
    </FlightBookingGate>
  )
}
