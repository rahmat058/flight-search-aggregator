import { describe, it, expect } from 'vitest'
import { paginate, FLIGHTS_PAGE_SIZE } from '@/lib/utils/pagination'

describe('paginate', () => {
  const items = Array.from({ length: 9 }, (_, index) => index + 1)

  it('returns the first page', () => {
    const result = paginate(items, 1, FLIGHTS_PAGE_SIZE)

    expect(result.items).toEqual([1, 2, 3])
    expect(result.total).toBe(9)
    expect(result.hasMore).toBe(true)
  })

  it('returns the last page without hasMore', () => {
    const result = paginate(items, 3, FLIGHTS_PAGE_SIZE)

    expect(result.items).toEqual([7, 8, 9])
    expect(result.hasMore).toBe(false)
  })
})
