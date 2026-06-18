import { test, expect } from '@playwright/test'

test.describe('Flight Search Aggregator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('search-form')).toBeVisible()
  })

  test('completes full search and booking flow', async ({ page }) => {
    await page.getByTestId('origin-select').selectOption('JFK')
    await page.getByTestId('destination-select').selectOption('LAX')
    await page.getByTestId('date-input').fill('2026-07-15')
    await page.getByTestId('passengers-select').selectOption('1')
    await page.getByTestId('search-btn').click()

    await expect(page.getByTestId('flight-results')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('flight-card').first()).toBeVisible()

    await page.getByTestId('select-flight-btn').first().click()
    await expect(page).toHaveURL(/\/flights\/[^/]+\/review/)
    await expect(page.getByTestId('booking-review')).toBeVisible()
    await page.getByTestId('proceed-booking-btn').click()

    await expect(page).toHaveURL(/\/flights\/[^/]+\/book/)
    await expect(page.getByTestId('booking-form')).toBeVisible()
    await page.getByTestId('first-name-input').fill('John')
    await page.getByTestId('last-name-input').fill('Doe')
    await page.getByTestId('email-input').fill('john.doe@example.com')
    await page.getByTestId('phone-input').fill('+1 (555) 123-4567')
    await page.getByTestId('submit-booking-btn').click()

    await expect(page).toHaveURL(/\/flights\/[^/]+\/confirmation/, { timeout: 10000 })
    await expect(page.getByTestId('booking-confirmation')).toBeVisible()
    await expect(page.getByTestId('booking-ref')).toBeVisible()
  })

  test('shows empty state for route with no flights', async ({ page }) => {
    await page.getByTestId('origin-select').selectOption('SEA')
    await page.getByTestId('destination-select').selectOption('MIA')
    await page.getByTestId('date-input').fill('2026-07-15')
    await page.getByTestId('search-btn').click()

    await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 15000 })
  })

  test('shows error state when search fails', async ({ page }) => {
    await page.route(/\/api\/flights\?/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unable to fetch flights. Please try again.' }),
      })
    })

    await page.getByTestId('date-input').fill('2026-07-15')
    await page.getByTestId('search-btn').click()

    await expect(page.getByTestId('error-state')).toBeVisible({ timeout: 15000 })
  })

  test('loads more paginated results', async ({ page }) => {
    await page.getByTestId('date-input').fill('2026-07-15')
    await page.getByTestId('search-btn').click()

    await expect(page.getByTestId('flight-results')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('flight-card')).toHaveCount(3)
    await expect(page.getByTestId('load-more-btn')).toBeVisible()

    await page.getByTestId('load-more-btn').click()
    await expect(page.getByTestId('flight-card')).toHaveCount(6, { timeout: 15000 })
  })

  test('filters results and keeps summary text consistent', async ({ page }) => {
    await page.getByTestId('date-input').fill('2026-07-15')
    await page.getByTestId('search-btn').click()

    await expect(page.getByTestId('flight-results')).toBeVisible({ timeout: 15000 })

    while (await page.getByTestId('load-more-btn').isVisible()) {
      await page.getByTestId('load-more-btn').click()
      await page.waitForTimeout(900)
    }

    const totalCards = await page.getByTestId('flight-card').count()
    expect(totalCards).toBeGreaterThanOrEqual(30)

    await page.getByRole('button', { name: 'Evening' }).click()

    const filteredCards = await page.getByTestId('flight-card').count()
    expect(filteredCards).toBeGreaterThan(0)
    expect(filteredCards).toBeLessThan(totalCards)
    await expect(page.getByTestId('filter-summary')).toContainText('match your filters')
  })

  test('disables confirm booking until form is valid', async ({ page }) => {
    await page.getByTestId('date-input').fill('2026-07-15')
    await page.getByTestId('search-btn').click()
    await expect(page.getByTestId('flight-results')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('select-flight-btn').first().click()
    await expect(page).toHaveURL(/\/flights\/[^/]+\/review/)
    await page.getByTestId('proceed-booking-btn').click()
    await expect(page).toHaveURL(/\/flights\/[^/]+\/book/)
    await expect(page.getByTestId('booking-form')).toBeVisible()

    await expect(page.getByTestId('submit-booking-btn')).toBeDisabled()

    await page.getByTestId('first-name-input').fill('John')
    await page.getByTestId('last-name-input').fill('Doe')
    await page.getByTestId('email-input').fill('john.doe@example.com')
    await page.getByTestId('phone-input').fill('+1 (555) 123-4567')

    await expect(page.getByTestId('submit-booking-btn')).toBeEnabled()
  })
})
