# SkyRoute — Flight Search Aggregator

A modern flight search and booking demo built with **Next.js 16**, **React 19**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS 4**. Search flights, filter and sort results, paginate through mock inventory, review a flight in a slide-in sidebar, then complete passenger details, payment, and confirmation — all powered by a local mock API.

## Features

- **Flight search** — origin, destination, date (validated window), and passenger count
- **Paginated results** — server-side pages with **Load more** button and infinite scroll (3 flights per page)
- **Sort & filter** — price, duration, departure time (radio cards), stops, and airlines (client-side on loaded results)
- **Unified result counts** — header, sidebar, and pagination summary stay in sync when filters are active
- **Lottie status animations** — `Plane.lottie` loading state, `Empty.lottie` for no results / filtered empty
- **Booking review sidebar** — slide-in panel on search results with smooth `translateX` transition (no route change)
- **Back to top** — portaled floating button with smooth scroll on long result lists
- **Multi-step booking** — passenger details → payment → confirmation at `/flights/[flightId]/…`
- **Two-column booking UX** — contact + passenger forms with sticky flight summary and session timer
- **Payment step** — mock Amex / Visa / Mastercard selection, fare breakdown, terms checkbox
- **Form validation** — react-hook-form with inline errors on the booking form
- **Error handling** — custom `app/error.tsx` (with error details) and `app/not-found.tsx` pages

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 16 (App Router)                         |
| UI         | React 19, Tailwind CSS 4, lucide-react          |
| Animation  | `@lottiefiles/dotlottie-react`                  |
| State      | Redux Toolkit + React-Redux                     |
| Forms      | react-hook-form                                 |
| Language   | TypeScript                                      |
| Unit tests | Vitest                                          |
| E2E tests  | Playwright                                      |

## Getting Started

### Prerequisites

- Node.js 24+
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

Click **Search** to fetch the first page of results. Select a flight to open the review sidebar, then continue through booking.

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
| `pnpm test:e2e`         | Run Playwright E2E tests (prod server on port **3100**) |
| `pnpm test:e2e:install` | Download Playwright Chromium browser (also runs on `pnpm install`) |
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
    review/page.tsx                 # Standalone review (direct URL)
    book/page.tsx                   # Passenger + contact details
    payment/page.tsx                # Payment method + fare breakdown
    confirmation/page.tsx           # Booking confirmation
  api/flights/
    route.ts                        # GET search (paginated) + POST booking
    [flightId]/route.ts             # GET single flight by ID

components/
  page/FlightSearchApp.tsx          # Home search + results orchestrator
  search/                           # SearchForm, results, filters, sort, pagination
  booking/                          # Sidebar, form, payment, confirmation, gate
  common/                           # StatusPanel, Loading/Error/Empty, BackToTop
  ui/                               # Button, Input, Select, Checkbox
  layout/                           # Header, Footer, CenteredMain
  providers/StoreProvider.tsx

data/
  airports.ts                       # 8 US airports
  paymentMethods.ts                 # Mock Amex / Visa / Mastercard cards
  flights.json                      # Optional export (`pnpm generate:flights`)

lib/
  mock/flightGenerator.ts           # 1000-flight catalog + date remapping
  store/slices/                     # search, filters, booking
  types/                            # Shared TypeScript interfaces
  utils/                            # Helpers, pagination, payment breakdown, summaries

public/animations/
  Plane.lottie                      # Loading animation
  Empty.lottie                      # Empty state animation

tests/
  unit/                             # Vitest
  playwright/                       # E2E
```

## Routes

| URL                                | Purpose                                      |
| ---------------------------------- | -------------------------------------------- |
| `/`                                | Search form + paginated results              |
| `/flights/[flightId]/review`       | Standalone review page (direct URL access)   |
| `/flights/[flightId]/book`         | Contact + passenger details                  |
| `/flights/[flightId]/payment`      | Payment method selection + fare breakdown    |
| `/flights/[flightId]/confirmation` | Booking confirmation                         |

Flight IDs follow the pattern `flt-{ORIGIN}-{DEST}-{YYYYMMDD}-{INDEX}` (e.g. `flt-JFK-LAX-20260715-00`).

### Booking flow

```
Search results
  └─ Select flight → FlightBookingSidebar (slide-in review)
       └─ Continue → /book (passenger details)
            └─ Continue → /payment (Amex / Visa / Mastercard)
                 └─ Proceed to payment → POST /api/flights → /confirmation
```

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

```bash
curl "http://localhost:3000/api/flights?origin=JFK&destination=LAX&date=2026-07-15&passengers=1&page=1&limit=3"
```

Response includes paginated `flights` and `meta` (`total`, `page`, `limit`, `hasMore`, `airlines`, `priceRange`, …).

### `GET /api/flights/[flightId]`

Returns a single flight resolved from the mock catalog (with date remapping applied from the ID).

### `POST /api/flights`

Creates a mock booking (called from the payment step after passenger details are saved in Redux).

```bash
curl -X POST http://localhost:3000/api/flights \
  -H "Content-Type: application/json" \
  -d '{"flightId":"flt-JFK-LAX-20260715-00","passenger":{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"5551234567"}}'
```

## Mock Data

| Property      | Value                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| Catalog size  | 1000 template flights (JFK → LAX has **30+** for the demo route)              |
| Airports      | 8 (56 directed routes)                                                        |
| Payment cards | Amex, Visa, Mastercard mock card metadata in `data/paymentMethods.ts`         |
| Storage       | In-memory generator at runtime                                                |
| Date handling | Templates stored on `2026-07-15`; search date applied via `applySearchDate()` |
| JSON export   | Optional — `data/flights.json` via `pnpm generate:flights`                    |

Per-route counts vary (~17 on most routes; **30+ on JFK → LAX**). Pagination loads **3 flights per page** by default.

## Testing

| Command         | Coverage |
| --------------- | -------- |
| `pnpm test`     | **39** unit tests — helpers, Redux, pagination, dates, mock data, summaries, payment breakdown, booking helpers |
| `pnpm test:e2e` | **9** Playwright scenarios — full booking (incl. payment), sidebar, empty route, filtered empty, API error, load more, filters, form + payment validation |

### Unit test files

| File | Covers |
| ---- | ------ |
| `flightHelpers.test.ts` | Filter, sort, format, validation helpers |
| `flightGenerator.test.ts` | Mock catalog size and demo route |
| `flightResultsSummary.test.ts` | Result count copy helpers |
| `pagination.test.ts` | Page slicing |
| `searchDate.test.ts` | Date window validation |
| `store.test.ts` | Search, filters, booking Redux slices |
| `paymentBreakdown.test.ts` | Fare line-item breakdown |
| `bookingHelpers.test.ts` | Passenger completeness guard |

### E2E scenarios

| Scenario | Validates |
| -------- | --------- |
| Full search and booking flow | Search → sidebar review → book → payment → confirmation |
| Booking sidebar on select | Review panel opens on home without route change |
| Empty state (no flights) | `Empty.lottie` empty state for SEA → MIA |
| Filtered empty state | No matches after applying filters |
| API error state | Error panel when search fails |
| Load more pagination | Appends next page of results |
| Departure time filter | Radio filter reduces visible cards |
| Passenger form validation | Continue disabled until required fields valid |
| Payment form validation | Proceed disabled until terms accepted |

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — routing, Redux, booking flow, sidebar, payment, animations
- [docs/project-requirement.md](./docs/project-requirement.md) — original take-home requirements

## License

Private — for evaluation purposes.
