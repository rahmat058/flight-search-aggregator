'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { BookingPassenger } from '@/lib/types/flight'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { updatePassenger } from '@/lib/store/slices/bookingSlice'
import { validateEmail, validatePhone } from '@/lib/utils/flightHelpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BookingFlightSummary } from './BookingFlightSummary'
import { BookingProgressSteps } from './BookingProgressSteps'
import { BookingSessionTimer } from './BookingSessionTimer'
import { ArrowLeft, Calendar, ChevronUp, Mail, Phone, User, Users } from 'lucide-react'
import { cn } from '@/utils/twMerge'

const titleOptions = ['MR.', 'MS.', 'MRS.'] as const

export function BookingForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedFlight, passenger, error } = useAppSelector((state) => state.booking)
  const { params } = useAppSelector((state) => state.search)
  const [title, setTitle] = useState<(typeof titleOptions)[number]>('MR.')

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

  const passengers = params.passengers || 1

  const onSubmit = (data: BookingPassenger) => {
    dispatch(updatePassenger(data))
    router.push(`/flights/${selectedFlight.id}/payment`)
  }

  return (
    <div className="animate-fade-in w-full" data-testid="booking-form">
      <button
        type="button"
        onClick={() => router.push('/')}
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </button>

      <BookingProgressSteps current="details" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <form id="booking-details-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section className="glass-card p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                  <Phone className="h-4 w-4 text-indigo-600" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Contact Details</h2>
                  <p className="text-sm text-slate-500">To receive your e-tickets &amp; updates</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label htmlFor="phone-input" className="text-sm font-medium text-slate-600">
                    Mobile No. <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex w-20 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/80 px-3 text-sm text-slate-600 shadow-sm">
                      +1
                    </span>
                    <input
                      id="phone-input"
                      type="tel"
                      placeholder="555 123 4567"
                      data-testid="phone-input"
                      className="min-w-0 flex-1 rounded-xl border border-white/60 bg-white/80 px-4 py-2.5 text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      {...register('phone', {
                        required: 'Phone number is required',
                        validate: (value) => validatePhone(value) || 'Please enter a valid phone number',
                      })}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
                </div>

                <Input
                  label={
                    <>
                      Email <span className="text-rose-500">*</span>
                    </>
                  }
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
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Passenger Details</h2>
                <p className="text-sm text-slate-500">Please provide the details of passenger</p>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-white/50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                      <Users className="h-4 w-4 text-amber-600" />
                    </span>
                    <p className="font-medium text-slate-800">Adult 1</p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden />
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-600">
                      Title <span className="text-rose-500">*</span>
                    </p>
                    <div className="inline-flex rounded-xl border border-slate-100 bg-white/70 p-1" role="radiogroup" aria-label="Title">
                      {titleOptions.map((option) => (
                        <label
                          key={option}
                          className={cn(
                            'cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all',
                            title === option
                              ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                              : 'text-slate-600 hover:bg-white',
                          )}>
                          <input
                            type="radio"
                            name="passenger-title"
                            value={option}
                            checked={title === option}
                            onChange={() => setTitle(option)}
                            className="sr-only"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={
                        <>
                          First Name (Given Name) <span className="text-rose-500">*</span>
                        </>
                      }
                      icon={<User className="h-4 w-4" />}
                      placeholder="John"
                      error={errors.firstName?.message}
                      data-testid="first-name-input"
                      {...register('firstName', { required: 'First name is required' })}
                    />
                    <Input
                      label={
                        <>
                          Last Name (Surname) <span className="text-rose-500">*</span>
                        </>
                      }
                      icon={<User className="h-4 w-4" />}
                      placeholder="Doe"
                      error={errors.lastName?.message}
                      data-testid="last-name-input"
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                  </div>

                  <Input
                    label="Date of Birth"
                    icon={<Calendar className="h-4 w-4" />}
                    type="date"
                    placeholder="MM, DD, YYYY"
                  />

                  <Input label="Frequent Flyer Number" placeholder="Optional" />
                </div>
              </div>
            </section>

            {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
          </form>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <BookingSessionTimer />
            <BookingFlightSummary flight={selectedFlight} passengers={passengers} />

            <Button
              type="submit"
              form="booking-details-form"
              className="w-full uppercase tracking-wide"
              size="lg"
              disabled={!isValid}
              data-testid="submit-booking-btn">
              Continue
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
