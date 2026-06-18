import { Check } from 'lucide-react'
import { forwardRef } from 'react'
import { cn } from '@/utils/twMerge'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode
  size?: 'sm' | 'md'
}

const boxSizeClasses = {
  sm: 'h-4 w-4 rounded-md',
  md: 'h-6 w-6 rounded-md',
} as const

const checkSizeClasses = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
} as const

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
} as const

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, size = 'md', className, id, disabled, ...props },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'group inline-flex cursor-pointer items-center gap-2.5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}>
      <input ref={ref} type="checkbox" id={id} disabled={disabled} className="peer sr-only" {...props} />
      <span
        className={cn(
          'flex shrink-0 items-center justify-center border shadow-sm transition-all duration-200',
          boxSizeClasses[size],
          'border-slate-300/90 bg-white/90',
          'group-hover:border-indigo-300 group-hover:bg-white',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-200 peer-focus-visible:ring-offset-1',
          'peer-checked:border-indigo-500 peer-checked:bg-indigo-500 peer-checked:shadow-indigo-500/20',
          'peer-checked:group-hover:border-indigo-600 peer-checked:group-hover:bg-indigo-600',
          'peer-checked:[&>svg]:opacity-100',
          'peer-disabled:cursor-not-allowed',
        )}>
        <Check
          strokeWidth={3}
          className={cn(checkSizeClasses[size], 'text-white opacity-0 transition-opacity duration-150')}
        />
      </span>
      {label != null && <span className={cn(labelSizeClasses[size], 'leading-snug text-slate-700')}>{label}</span>}
    </label>
  )
})
