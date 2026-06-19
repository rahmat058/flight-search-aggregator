import { cn } from '@/utils/twMerge'

type BookingStep = 'details' | 'payment'

interface BookingProgressStepsProps {
  current: BookingStep
}

const steps = [
  { id: 'details' as const, label: 'Enter ticket details' },
  { id: 'payment' as const, label: 'Complete payment' },
]

export function BookingProgressSteps({ current }: BookingProgressStepsProps) {
  const currentIndex = steps.findIndex((step) => step.id === current)

  return (
    <nav aria-label="Booking progress" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-wide uppercase">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = step.id === current

          return (
            <li key={step.id} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-300">›</span>}
              <span
                className={cn(
                  isCurrent && 'text-indigo-600',
                  isComplete && 'text-teal-600',
                  !isCurrent && !isComplete && 'text-slate-400',
                )}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
