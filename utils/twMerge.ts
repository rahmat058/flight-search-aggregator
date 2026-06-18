import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

/**
 * Intelligently merges Tailwind CSS class names
 *
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution.
 * This ensures that conflicting Tailwind classes are properly resolved (e.g., 'p-4' and 'p-2').
 *
 * @param classes - Variable number of class values (strings, objects, arrays, etc.)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * ```ts
 * cn('base', isActive && 'active', 'p-4', 'p-2') // Returns: 'base active p-2'
 * cn({ 'text-red': hasError }, 'text-blue') // Returns: 'text-blue' (conflict resolved)
 * ```
 */
export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))
