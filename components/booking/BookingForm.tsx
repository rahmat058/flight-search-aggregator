'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { BookingPassenger } from '@/lib/types/flight'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { submitBooking } from '@/lib/store/slices/bookingSlice'
import { validateEmail, validatePhone } from '@/lib/utils/flightHelpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, CheckCircle, Mail, Phone, User } from 'lucide-react'

export function BookingForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedFlight, passenger, status, error } = useAppSelector((state) => state.booking)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BookingPassenger>({
    defaultValues: passenger,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  if (!selectedFlight) return null

  const onSubmit = async (data: BookingPassenger) => {
    const result = await dispatch(submitBooking({ flight: selectedFlight, passenger: data }))

    if (submitBooking.fulfilled.match(result)) {
      router.push(`/flights/${selectedFlight.id}/confirmation`)
    }
  }

  return (
    <div className="animate-fade-in w-full max-w-lg" data-testid="booking-form">
      <div className="glass-card p-6 sm:p-8">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-slate-800">
          <User className="h-6 w-6 text-indigo-500" />
          Passenger details
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Enter your information to complete the booking for {selectedFlight.flightNumber}.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              icon={<User className="h-4 w-4" />}
              placeholder="John"
              error={errors.firstName?.message}
              data-testid="first-name-input"
              {...register('firstName', { required: 'First name is required' })}
            />
            <Input
              label="Last name"
              icon={<User className="h-4 w-4" />}
              placeholder="Doe"
              error={errors.lastName?.message}
              data-testid="last-name-input"
              {...register('lastName', { required: 'Last name is required' })}
            />
          </div>

          <Input
            label="Email address"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            placeholder="john.doe@example.com"
            error={errors.email?.message}
            data-testid="email-input"
            {...register('email', {
              required: 'Email is required',
              validate: (value) => validateEmail(value) || 'Please enter a valid email address',
            })}
          />

          <Input
            label="Phone number"
            icon={<Phone className="h-4 w-4" />}
            type="tel"
            placeholder="+1 (555) 123-4567"
            error={errors.phone?.message}
            data-testid="phone-input"
            {...register('phone', {
              required: 'Phone number is required',
              validate: (value) => validatePhone(value) || 'Please enter a valid phone number',
            })}
          />

          {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push(`/flights/${selectedFlight.id}/review`)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              loading={status === 'submitting'}
              disabled={!isValid}
              data-testid="submit-booking-btn">
              <CheckCircle className="h-4 w-4" />
              Confirm booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
