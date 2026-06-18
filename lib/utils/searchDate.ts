export const MAX_SEARCH_DAYS_AHEAD = 365

export const getMinSearchDate = (): string => new Date().toISOString().split('T')[0]

export const getMaxSearchDate = (): string => {
  const max = new Date()
  max.setUTCDate(max.getUTCDate() + MAX_SEARCH_DAYS_AHEAD)
  return max.toISOString().split('T')[0]
}

export const isValidSearchDate = (date: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false

  const parsed = Date.parse(`${date}T12:00:00.000Z`)
  if (Number.isNaN(parsed)) return false

  const min = Date.parse(`${getMinSearchDate()}T00:00:00.000Z`)
  const max = Date.parse(`${getMaxSearchDate()}T23:59:59.999Z`)

  return parsed >= min && parsed <= max
}

export const getSearchDateError = (date: string): string | null => {
  if (isValidSearchDate(date)) return null
  return `Departure date must be between ${getMinSearchDate()} and ${getMaxSearchDate()}.`
}

export const departureMatchesDate = (departureTime: string, date: string): boolean =>
  departureTime.startsWith(date)
