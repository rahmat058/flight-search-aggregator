import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000'
const useExternalBaseUrl = Boolean(process.env.PLAYWRIGHT_BASE_URL)

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 120 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['github'], ['html', { open: 'never' }]],
  /** Single browser project — matches https://playwright.dev/docs/running-tests#run-tests-in-headed-mode */
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  ...(useExternalBaseUrl
    ? {}
    : {
        webServer: {
          command: 'pnpm run build && PORT=3000 pnpm run start',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 10 * 60 * 1000,
        },
      }),
})
