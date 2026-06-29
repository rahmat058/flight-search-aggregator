'use client'

import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { loadMoreFlights } from '@/lib/store/slices/searchSlice'
import { getPaginationSummary, hasActiveFilters } from '@/lib/utils/flightResultsSummary'

interface FlightResultsPaginationProps {
  displayedCount: number
}

export function FlightResultsPagination({ displayedCount }: FlightResultsPaginationProps) {
  const dispatch = useAppDispatch()
  const { flights, meta, loadMoreStatus, loadMoreError } = useAppSelector((state) => state.search)
  const { filters } = useAppSelector((state) => state.filters)
  const hasMore = Boolean(meta?.hasMore)
  const isLoading = loadMoreStatus === 'loading'

  const sentinelRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(isLoading)

  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  useEffect(() => {
    if (!hasMore) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingRef.current) {
          dispatch(loadMoreFlights())
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [dispatch, hasMore, meta?.page])

  if (!meta || meta.total === 0) return null

  const summary = getPaginationSummary({
    displayed: displayedCount,
    loaded: flights.length,
    total: meta.total,
    hasMore,
    filtersActive: hasActiveFilters(filters, meta.priceRange.max),
  })

  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      {summary && (
        <p className="text-sm text-slate-500" data-testid="pagination-summary">
          {summary}
        </p>
      )}

      {loadMoreError && (
        <p className="text-sm text-rose-600" data-testid="load-more-error">
          {loadMoreError}
        </p>
      )}

      {hasMore && (
        <>
          <div ref={sentinelRef} className="h-px w-full" aria-hidden data-testid="load-more-sentinel" />
          <Button
            variant="outline"
            loading={isLoading}
            onClick={() => dispatch(loadMoreFlights())}
            data-testid="load-more-btn">
            <ChevronDown className="h-4 w-4" />
            Load more flights
          </Button>
        </>
      )}
    </div>
  )
}
