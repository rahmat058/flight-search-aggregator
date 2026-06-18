# SkyRoute — Flight Search Aggregator

A modern flight search and booking demo built with **Next.js 16**, **React 19**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS 4**. Search flights, filter and sort results, paginate through mock inventory, then complete a multi-route booking flow — all powered by a local mock API.

## Features

- **Flight search** — origin, destination, date (validated window), and passenger count
- **Paginated results** — server-side pages with **Load more** button and infinite scroll (3 flights per page)
- **Sort & filter** — price, duration, departure time, stops, airlines, and time-of-day (client-side on loaded results)
- **Unified result counts** — header, sidebar, and pagination summary stay in sync when filters are active
- **Back to top** — floating button (portaled, high z-index) with smooth scroll on long result lists
- **Application states** — shared loading, error, and empty components under `components/common/`
- **Multi-route booking** — review → passenger form → confirmation at `/flights/[flightId]/…`
- **Form validation** — react-hook-form with inline errors on the booking form
- **Error handling** — custom `app/error.tsx` (with error details) and `app/not-found.tsx` pages

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Framework  | Next.js 16 (App Router)                |
| UI         | React 19, Tailwind CSS 4, lucide-react |
| State      | Redux Toolkit + React-Redux            |
| Forms      | react-hook-form                        |
| Language   | TypeScript                             |
| Unit tests | Vitest                                 |
| E2E tests  | Playwright                             |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended)

### Install & run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) or [https://flight-search-aggregator.vercel.app](https://flight-search-aggregator.vercel.app).

### Default search

The app pre-fills a popular route for quick testing:

- **From:** New York (JFK)
- **To:** Los Angeles (LAX)
- **Date:** July 15, 2026
- **Passengers:** 1

Click **Search** to fetch the first page of results. Use **Load more**, scroll to the bottom (infinite scroll), or the **back-to-top** button after scrolling down.

### Demo notes

- **1000** template flights across all **56** airport pairs (8 airports)
- Dates are **remapped at search time** from a canonical template date — you do not need a separate JSON row per day
- Departure dates must fall within **today → 12 months ahead**
- **SEA → MIA** on **2026-07-15** intentionally returns no flights (empty-state E2E test)

## Scripts

| Command                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `pnpm dev`              | Start development server                       |
| `pnpm build`            | Production build                               |
| `pnpm start`            | Start production server                        |
| `pnpm lint`             | Run ESLint                                     |
| `pnpm test`             | Run unit tests (Vitest)                        |
| `pnpm test:watch`       | Run unit tests in watch mode                   |
| `pnpm test:e2e`         | Run Playwright E2E tests                       |
| `pnpm test:all`         | Run all tests                                  |
| `pnpm generate:flights` | Export template catalog to `data/flights.json` |

## Project Structure

```
app/
  page.tsx                          # Home — search + results
  layout.tsx                        # Root shell, Header, Footer, Redux provider
  error.tsx                         # Route error boundary (client)
  not-found.tsx                     # Custom 404 page
  flights/[flightId]/
    review/page.tsx                 # Review selected flight
    book/page.tsx                   # Passenger details
    confirmation/page.tsx           # Booking confirmation
  api/flights/
    route.ts                        # GET search (paginated) + POST booking
    [flightId]/route.ts             # GET single flight by ID

components/
  page/FlightSearchApp.tsx          # Home search + results orchestrator
  search/                           # SearchForm, results, filters, sort, pagination
  booking/                          # Review, form, confirmation, route gate
  common/                           # StatusPanel, Loading/Error/Empty, BackToTop
  ui/                               # Button, Input, Select, Checkbox
  layout/                           # Header (home link), Footer, CenteredMain
  providers/StoreProvider.tsx

data/
  airports.ts                       # 8 US airports
  flights.json                      # Optional export (`pnpm generate:flights`)

lib/
  mock/flightGenerator.ts           # 1000-flight catalog + date remapping
  store/slices/                     # search, filters, booking
  types/                            # Shared TypeScript interfaces
  utils/                            # Helpers, pagination, search date, summaries

tests/
  unit/                             # Vitest
  playwright/                       # E2E
```

## Routes

| URL                                | Purpose                         |
| ---------------------------------- | ------------------------------- |
| `/`                                | Search form + paginated results |
| `/flights/[flightId]/review`       | Review flight before booking    |
| `/flights/[flightId]/book`         | Passenger details form          |
| `/flights/[flightId]/confirmation` | Booking confirmation            |

Flight IDs follow the pattern `flt-{ORIGIN}-{DEST}-{YYYYMMDD}-{INDEX}` (e.g. `flt-JFK-LAX-20260715-00`).

## Mock API

### `GET /api/flights`

Query parameters:

| Param         | Required | Description                           |
| ------------- | -------- | ------------------------------------- |
| `origin`      | yes      | 3-letter airport code                 |
| `destination` | yes      | 3-letter airport code                 |
| `date`        | yes      | `YYYY-MM-DD` within searchable window |
| `passengers`  | no       | Defaults to `1`                       |
| `page`        | no       | Defaults to `1`                       |
| `limit`       | no       | Defaults to `3` (max `20`)            |

Use `http://localhost:3000` for local development or `https://flight-search-aggregator.vercel.app` for the deployed app.

```bash
curl "http://localhost:3000/api/flights?origin=JFK&destination=LAX&date=2026-07-15&passengers=1&page=1&limit=3"
or
curl "https://flight-search-aggregator.vercel.app/api/flights?origin=JFK&destination=LAX&date=2026-07-15&passengers=1&page=1&limit=3"
```

Response includes paginated `flights` and `meta` (`total`, `page`, `limit`, `hasMore`, `airlines`, `priceRange`, …).

### `GET /api/flights/[flightId]`

Returns a single flight resolved from the mock catalog (with date remapping applied from the ID).

### `POST /api/flights`

Creates a mock booking.

Use `http://localhost:3000` for local development or `https://flight-search-aggregator.vercel.app` for the deployed app.

```bash
curl -X POST https://flight-search-aggregator.vercel.app/api/flights \
  -H "Content-Type: application/json" \
  -d '{"flightId":"flt-JFK-LAX-20260715-00","passenger":{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"5551234567"}}'
```

## Mock Data

| Property      | Value                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| Catalog size  | 1000 template flights (JFK → LAX has **30+** for the demo route)              |
| Airports      | 8 (56 directed routes)                                                        |
| Storage       | In-memory generator at runtime                                                |
| Date handling | Templates stored on `2026-07-15`; search date applied via `applySearchDate()` |
| JSON export   | Optional — `data/flights.json` via `pnpm generate:flights`                    |

Per-route counts vary (~17 on most routes; **30+ on JFK → LAX**). Pagination loads **3 flights per page** by default.

## Testing

| Command | Coverage |
|---------|----------|
| `pnpm test` | **35** unit tests — helpers, Redux, pagination, dates, mock data, summaries |
| `pnpm test:e2e` | **6** Playwright scenarios — full booking, empty route, API error, load more, filters, form validation |

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — routing, Redux, data flow, pagination, BackToTop
- [docs/REQUIREMENTS-CHECKLIST.md](./docs/REQUIREMENTS-CHECKLIST.md) — take-home requirements mapping

## License

Private — for evaluation purposes.
