'use client'

import { createPortal } from 'react-dom'
import { cn } from '@/utils/twMerge'
import { Check, ChevronDown } from 'lucide-react'
import { fieldInputClasses } from '@/components/ui/Input'
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
}

type SelectSize = 'sm' | 'md'

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> {
  label?: string
  error?: string
  icon?: React.ReactNode
  options: SelectOption[]
  size?: SelectSize
}

const triggerSizeClasses: Record<SelectSize, string> = {
  sm: 'rounded-lg px-3 py-2 text-sm pr-9',
  md: 'rounded-xl px-4 py-2.5 text-sm pr-11',
}

const chevronSlotClasses: Record<SelectSize, string> = {
  sm: 'w-9',
  md: 'w-11',
}

const chevronIconClasses: Record<SelectSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

const menuItemSizeClasses: Record<SelectSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
}

const labelSizeClasses: Record<SelectSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, icon, options, size = 'md', className, id, value, onChange, disabled, ...props },
  ref,
) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const listboxId = `${selectId}-listbox`

  const selectedOption = options.find((opt) => opt.value === value)

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    setMenuStyle({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    if (!open) return

    updateMenuPosition()

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (containerRef.current?.contains(target) || listboxRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const handleScrollOrResize = () => updateMenuPosition()

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [open, updateMenuPosition])

  const handleSelect = (optionValue: string) => {
    if (disabled) return

    onChange?.({
      target: { value: optionValue },
      currentTarget: { value: optionValue },
    } as React.ChangeEvent<HTMLSelectElement>)
    setOpen(false)
  }

  const dropdown =
    open &&
    createPortal(
      <ul
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={label ? `${selectId}-label` : undefined}
        style={menuStyle}
        className="fixed z-200 max-h-60 overflow-auto rounded-xl border border-white/60 bg-white p-1.5 shadow-lg shadow-indigo-500/10 backdrop-blur-sm">
        {options.map((opt) => {
          const selected = opt.value === value

          return (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-full transition-colors',
                  menuItemSizeClasses[size],
                  selected
                    ? 'bg-indigo-50 font-medium text-indigo-700'
                    : 'text-slate-700 hover:bg-indigo-50/80 hover:text-indigo-700',
                )}>
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {selected && <Check className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2.5} />}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            </li>
          )
        })}
      </ul>,
      document.body,
    )

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      {label && (
        <label
          id={`${selectId}-label`}
          htmlFor={selectId}
          className={cn('flex items-center gap-1.5 font-medium text-slate-600', labelSizeClasses[size])}>
          {icon}
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-controls={listboxId}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            fieldInputClasses,
            'relative flex w-full items-center text-left',
            triggerSizeClasses[size],
            open && 'z-1 border-indigo-300 bg-white ring-2 ring-indigo-200',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}>
          <span className="truncate">{selectedOption?.label ?? 'Select…'}</span>
          <span
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center text-slate-500',
              chevronSlotClasses[size],
            )}>
            <ChevronDown
              className={cn(chevronIconClasses[size], 'transition-transform duration-200', open && 'rotate-180')}
            />
          </span>
        </button>
      </div>

      {dropdown}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
})
