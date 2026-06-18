export const FLIGHTS_PAGE_SIZE = 3

export const paginate = <T,>(items: T[], page: number, limit: number) => {
  const safePage = Math.max(1, page)
  const safeLimit = Math.max(1, limit)
  const start = (safePage - 1) * safeLimit

  return {
    items: items.slice(start, start + safeLimit),
    page: safePage,
    limit: safeLimit,
    total: items.length,
    hasMore: start + safeLimit < items.length,
  }
}
