import { forwardRef, useRef } from 'react'
import { cn } from '@/utils/twMerge'

export const fieldInputClasses =
  'cursor-pointer rounded-xl border border-white/60 bg-white/80 px-4 py-2.5 text-slate-800 shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:outline-none disabled:cursor-not-allowed w-full'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, className, id, type, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const inputRef = useRef<HTMLInputElement>(null)

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const iconInInput = Boolean(icon && type === 'date')

  const openDatePicker = () => {
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.showPicker?.()
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          {icon && !iconInInput && icon}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={setRefs}
          id={inputId}
          type={type}
          className={cn(
            fieldInputClasses,
            iconInInput &&
              'pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200',
            className,
          )}
          {...props}
        />
        {iconInInput && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer text-indigo-500"
            onClick={openDatePicker}
            aria-label={label ? `Open ${label}` : 'Open date picker'}>
            {icon}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
})
