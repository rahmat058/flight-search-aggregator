'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { clearSelectedFlight } from '@/lib/store/slices/bookingSlice'
import { BookingReviewDetails } from './BookingReviewDetails'

export function BookingReview() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedFlight } = useAppSelector((state) => state.booking)
  const { params } = useAppSelector((state) => state.search)

  if (!selectedFlight) return null

  const passengers = params.passengers || 1

  const handleBack = () => {
    dispatch(clearSelectedFlight())
    router.push('/')
  }

  const handleContinue = () => {
    router.push(`/flights/${selectedFlight.id}/book`)
  }

  return (
    <div className="animate-fade-in w-full max-w-2xl" data-testid="booking-review">
      <div className="glass-card p-6 sm:p-8">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-slate-800">
          <ClipboardCheck className="h-6 w-6 text-indigo-500" />
          Review your flight
        </h2>
        <p className="mb-6 text-sm text-slate-500">Please confirm the details before proceeding to booking.</p>

        <BookingReviewDetails flight={selectedFlight} passengers={passengers} />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Button>
          <Button onClick={handleContinue} data-testid="proceed-booking-btn">
            Continue to booking
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
