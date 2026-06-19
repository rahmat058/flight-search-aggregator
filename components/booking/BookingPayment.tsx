'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, CreditCard, ShieldCheck } from 'lucide-react'
import { PAYMENT_METHODS } from '@/data/paymentMethods'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setPaymentMethod, submitBooking } from '@/lib/store/slices/bookingSlice'
import { buildPaymentBreakdown } from '@/lib/utils/paymentBreakdown'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { BookingPaymentBreakdown } from './BookingPaymentBreakdown'
import { BookingProgressSteps } from './BookingProgressSteps'
import { BookingSessionTimer } from './BookingSessionTimer'
import { cn } from '@/utils/twMerge'
import type { PaymentMethodId } from '@/lib/types/flight'

export function BookingPayment() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedFlight, passenger, status, error } = useAppSelector((state) => state.booking)
  const { params } = useAppSelector((state) => state.search)
  const [selectedMethodId, setSelectedMethodId] = useState<PaymentMethodId>('visa')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  if (!selectedFlight) return null

  const passengers = params.passengers || 1
  const ticketTotal = selectedFlight.price * passengers
  const breakdown = buildPaymentBreakdown(ticketTotal)
  const canSubmit = acceptedTerms && Boolean(selectedMethodId)

  const handleSubmit = async () => {
    const paymentMethod = PAYMENT_METHODS.find((method) => method.id === selectedMethodId)
    if (!paymentMethod) return

    dispatch(setPaymentMethod(paymentMethod))

    const result = await dispatch(
      submitBooking({
        flight: selectedFlight,
        passenger,
        paymentMethod,
      }),
    )

    if (submitBooking.fulfilled.match(result)) {
      router.push(`/flights/${selectedFlight.id}/confirmation`)
    }
  }

  return (
    <div className="animate-fade-in w-full" data-testid="booking-payment">
      <button
        type="button"
        onClick={() => router.push(`/flights/${selectedFlight.id}/book`)}
        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="h-4 w-4" />
        Back to passenger details
      </button>

      <BookingProgressSteps current="payment" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="glass-card p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Terms &amp; conditions</h2>
                <p className="text-sm text-slate-500">Please review before completing payment</p>
              </div>
            </div>

            <Checkbox
              id="payment-terms"
              size="md"
              label="I have read and agree to the Terms of Use, Privacy Policy, and Cancellation Policy."
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              data-testid="payment-terms-checkbox"
            />
          </section>

          <section className="glass-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Select payment method</h2>

            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
              {PAYMENT_METHODS.map((method) => {
                const active = selectedMethodId === method.id

                return (
                  <label
                    key={method.id}
                    className={cn(
                      'relative cursor-pointer rounded-xl border p-4 transition-all',
                      active
                        ? 'border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-500/10'
                        : 'border-slate-100 bg-white/70 hover:border-indigo-200 hover:bg-white',
                    )}
                    data-testid={`payment-method-${method.id}`}>
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={active}
                      onChange={() => setSelectedMethodId(method.id)}
                      className="sr-only"
                    />

                    {active && (
                      <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}

                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                    </div>

                    <p className="font-semibold text-slate-800">{method.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{method.brand}</p>
                    <p className="mt-3 font-mono text-sm text-slate-700">•••• •••• •••• {method.last4}</p>
                    <p className="text-xs text-slate-400">
                      {method.cardholder} · Exp {method.expiry}
                    </p>
                  </label>
                )
              })}
            </div>
          </section>

          {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <BookingSessionTimer />
            <BookingPaymentBreakdown breakdown={breakdown} />

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
              <p className="font-semibold text-slate-700">Please note</p>
              <p className="mt-1">
                The seat will not be reserved unless you proceed to payment. Processing fees are non-refundable.
              </p>
            </div>

            <Button
              className="w-full uppercase tracking-wide"
              size="lg"
              loading={status === 'submitting'}
              disabled={!canSubmit}
              onClick={handleSubmit}
              data-testid="submit-payment-btn">
              Proceed to payment
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
