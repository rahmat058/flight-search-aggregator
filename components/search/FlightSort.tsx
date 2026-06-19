'use client'

import { ArrowUpDown } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import type { SortOption } from '@/lib/types/flight'
import { setSortBy } from '@/lib/store/slices/filtersSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'duration-asc', label: 'Duration: Shortest' },
  { value: 'departure-asc', label: 'Departure: Earliest' },
  { value: 'departure-desc', label: 'Departure: Latest' },
]

export function FlightSort() {
  const dispatch = useAppDispatch()
  const sortBy = useAppSelector((state) => state.filters.sortBy)

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort-select"
        className="flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-slate-600">
        <ArrowUpDown className="h-4 w-4" />
        Sort by
      </label>
      <Select
        id="sort-select"
        value={sortBy}
        size="sm"
        options={sortOptions}
        onChange={(e) => dispatch(setSortBy(e.target.value as SortOption))}
        data-testid="sort-select"
        className="min-w-48"
      />
    </div>
  )
}

export { sortOptions }
