# Architecture

## Overview

SkyRoute is a flight search and booking demo on the **Next.js App Router**. Search and results live on `/`; booking steps use **dedicated routes** keyed by flight ID. A mock REST API serves paginated flight data from an in-memory generator (not static JSON at runtime).

Open [http://localhost:3000](http://localhost:3000) or [https://flight-search-aggregator.vercel.app](https://flight-search-aggregator.vercel.app).

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                          │
│  ┌──────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │
│  │  SearchForm  │  │   FlightResults     │  │  Booking routes   │ │
│  │  (home /)    │  │ Filters · Sort ·    │  │ /flights/[id]/     │ │
│  │              │  │ Pagination          │  │ review·book·confirm│ │
│  └──────┬───────┘  └──────────┬──────────┘  └─────────┬─────────┘ │
│         │                     │                        │           │
│         └─────────────────────┼────────────────────────┘           │
│                               ▼                                    │
│                   ┌───────────────────────┐                        │
│                   │  Redux Toolkit Store   │                        │
│                   │  search │ filters │    │                        │
│                   │         booking       │                        │
│                   └───────────┬───────────┘                        │
└───────────────────────────────┼────────────────────────────────────┘
                                │ fetch()
                                ▼
                   ┌───────────────────────┐
                   │   /api/flights         │
                   │   GET  → search (paged)│
                   │   POST → book          │
                   │   GET /[flightId]      │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │ lib/mock/              │
                   │ flightGenerator.ts     │
                   │ 1000 templates + date  │
                   │ remapping at search    │
                   └───────────────────────┘
```

## Design Principles

1. **Separation of concerns** — UI renders; Redux holds client state; pure utils handle filter/sort/format logic; API routes own data access and pagination.
2. **Route-based booking** — Navigation uses Next.js routes + `useRouter()`, not a monolithic step enum on the home page.
3. **Server pagination, client filtering** — API returns pages of flights; filters and sort run in-memory on **loaded** results for instant UX.
4. **Shared status UI** — Loading, error, and empty states use reusable components in `components/common/`.
5. **Reusable UI primitives** — `Button`, `Input`, `Select`, and `Checkbox` provide consistent styling (custom Tailwind, no Radix).
6. **Progressive UX** — Pagination + infinite scroll for large result sets; portaled **Back to top** for long pages.

## App Routes

| Route                              | Component             | Role                                      |
| ---------------------------------- | --------------------- | ----------------------------------------- |
| `/`                                | `FlightSearchApp`     | Search form + results                     |
| `/flights/[flightId]/review`       | `BookingReview`       | Confirm flight details                    |
| `/flights/[flightId]/book`         | `BookingForm`         | Passenger form (react-hook-form)          |
| `/flights/[flightId]/confirmation` | `BookingConfirmation` | Success screen                            |
| `app/error.tsx`                    | Error boundary        | Unexpected render errors + message digest |
| `app/not-found.tsx`                | 404                   | Unknown URLs                              |

`FlightBookingGate` wraps booking pages: resolves flight by ID via `findFlightById()`, syncs Redux, redirects invalid IDs, and centers content with `CenteredMain`.

## State Management

Redux Toolkit with three slices:

### `searchSlice`

| Field                     | Purpose                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `params`                  | Search criteria (origin, destination, date, passengers)       |
| `flights`                 | **Accumulated** flight results (pages appended on load more)  |
| `meta`                    | `total`, `page`, `limit`, `hasMore`, airlines, price range, … |
| `status`                  | `idle` \| `loading` \| `succeeded` \| `failed`                |
| `loadMoreStatus`          | `idle` \| `loading` \| `failed`                               |
| `error` / `loadMoreError` | Error messages                                                |

**Async thunks:**

- `searchFlights` — `GET /api/flights?page=1&limit=3` — replaces flights
- `loadMoreFlights` — fetches next page — **appends** to `flights`

Search visibility on home is driven by `search.status !== 'idle'`, not a booking step.

### `filtersSlice`

| Field                     | Purpose                                        |
| ------------------------- | ---------------------------------------------- |
| `filters.maxPrice`        | Max ticket price (null = any)                  |
| `filters.maxStops`        | Max stops (null = any)                         |
| `filters.airlines`        | Selected airline names                         |
| `filters.departureWindow` | `any` \| `morning` \| `afternoon` \| `evening` |
| `sortBy`                  | Active sort option                             |

Filters reset when a new search is submitted. Filter metadata (`airlines`, `priceRange`) comes from the **full** API result set, not just the current page.

### `bookingSlice`

| Field              | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `selectedFlight`   | Flight chosen for booking                            |
| `passenger`        | Form defaults / persisted passenger fields           |
| `booking`          | Confirmed booking (reference, passenger, `bookedAt`) |
| `status`           | Booking submit state                                 |
| `validationErrors` | Legacy field errors (form uses react-hook-form)      |

**Async thunk:** `submitBooking` — `POST /api/flights`, then client navigates to confirmation route.

There is **no** `step` field — booking navigation is URL-based.

## Data Flow

### Search Flow

1. User edits form → `updateSearchParams`
2. User clicks Search → client validates date window → `searchFlights` (page 1)
3. API paginates matching flights → first page stored in Redux
4. `FlightResults` applies `filterFlights()` + `sortFlights()` via `useMemo`
5. User clicks **Load more**, scrolls to sentinel, or uses **Back to top** after scrolling → `loadMoreFlights` appends next page / smooth scroll to top
6. Header, sidebar (`filter-summary`), and pagination text use `flightResultsSummary.ts` for consistent counts

### Booking Flow

1. User clicks **Select** on a card → `setSelectedFlight` + `router.push(/flights/{id}/review)`
2. **Continue to booking** → `/flights/{id}/book`
3. Valid form submit → `submitBooking` → `/flights/{id}/confirmation`
4. **Search for another flight** → `router.replace('/')` then reset search + booking state
5. **Back to results** on review → clears selected flight, returns home (search state preserved)

`FlightBookingGate` on confirmation requires `booking` in Redux; clearing booking during navigation is handled to avoid redirect loops.

## Mock Data Model

Implemented in `lib/mock/flightGenerator.ts`:

| Concept                     | Detail                                                          |
| --------------------------- | --------------------------------------------------------------- |
| `MOCK_FLIGHT_COUNT`         | 1000 template flights                                           |
| Routes                      | All 8×7 directed airport pairs (56 routes)                      |
| `DEMO_ROUTE_MIN_FLIGHTS`    | JFK → LAX guaranteed **30+** templates (assignment requirement) |
| `CANONICAL_DATE`            | `2026-07-15` — templates stored on this date                    |
| `applySearchDate()`         | Remaps departure/arrival times and IDs to the searched date     |
| `isFlightScheduledOnDate()` | Hash-based subset on non-demo dates (~⅔ of templates)           |
| `EMPTY_ROUTE_KEYS`          | `SEA-MIA-2026-07-15` → empty (E2E)                              |
| `findFlightById()`          | Resolves template by origin/dest/index, applies date from ID    |

Runtime API uses the generator directly. `pnpm generate:flights` optionally exports the template catalog to `data/flights.json`.

### Date validation

`lib/utils/searchDate.ts` enforces departures between **today** and **365 days ahead**. Invalid dates return API 400 / Redux error — they do not return flights.

## Pagination

| Layer               | Behavior                                                             |
| ------------------- | -------------------------------------------------------------------- |
| `FLIGHTS_PAGE_SIZE` | 3 (default)                                                          |
| API                 | `page`, `limit` query params; `paginate()` helper slices results     |
| Redux               | `searchFlights` replaces; `loadMoreFlights` appends                  |
| UI                  | `FlightResultsPagination` — button + Intersection Observer sentinel  |
| Back to top         | `BackToTop` — portaled to `document.body`, `z-[9999]`, smooth scroll |

Meta fields: `total`, `page`, `limit`, `hasMore`.

## Back to Top

`components/common/BackToTop.tsx`:

- Renders via **React portal** on `document.body` so it stays fixed to the viewport (escapes parent stacking contexts from results/filters).
- Appears after **320px** scroll; uses `window.scrollTo({ behavior: 'smooth' })`.
- Global `scroll-behavior: smooth` on `html` in `globals.css`.
- Used in `FlightResults` when search results are displayed.

## Filtering, Sorting & Result Copy

**Pure functions** in `lib/utils/flightHelpers.ts`:

- `filterFlights()` — price, stops, airline, departure window
- `sortFlights()` — price, duration, departure time

**Summary helpers** in `lib/utils/flightResultsSummary.ts`:

- `hasActiveFilters()` — detects non-default filter state
- `getResultsHeadline()` — header title
- `getFilterSidebarSummary()` — sidebar under Filters heading
- `getPaginationSummary()` — footer load-more area

When filters are active, copy reflects **matching** vs **loaded** vs **total** (e.g. `4 matching · 18 of 18 loaded`).

## Component Hierarchy

```
RootLayout (app-bg, Header, Footer)
└── StoreProvider
    ├── Home (/)
    │   └── FlightSearchApp
    │       ├── SearchForm
    │       └── FlightResults
    │           ├── FlightSort
    │           ├── FlightFilters (+ filter-summary)
    │           ├── FlightCard[]
    │           ├── FlightResultsPagination
    │           └── BackToTop (portal → body)
    │
    ├── /flights/[flightId]/review
    │   └── FlightBookingGate → BookingReview
    ├── /flights/[flightId]/book
    │   └── FlightBookingGate → BookingForm
    └── /flights/[flightId]/confirmation
        └── FlightBookingGate (requireBooking) → BookingConfirmation
```

## Mock API Design

`app/api/flights/route.ts`:

- Simulated latency: 800ms (GET), 600ms (POST)
- **GET** validates origin, destination, date window, distinct airports
- Filters by route + passenger seat availability, then paginates
- Returns full-route metadata for filter UI (`airlines`, `priceRange` from all matches)
- **POST** validates passenger payload, resolves flight by ID, returns `SKY…` reference

`app/api/flights/[flightId]/route.ts` — single-flight lookup.

## Styling

Tailwind CSS 4 with a custom design system in `app/globals.css`:

- **Gradient background** — indigo/violet/cyan layers + blurred purple top glow (`::before`)
- **Glass cards** — frosted panels with backdrop blur
- **Header/Footer** — matching indigo border separation; header logo links home (`/`)
- **Font** — Roboto via `next/font`
- **Smooth scrolling** — `scroll-behavior: smooth` on `html`

### Z-index layers

| Layer                     | z-index       | Notes                        |
| ------------------------- | ------------- | ---------------------------- |
| Search / results sections | `z-10`–`z-20` | Stacking for form vs results |
| Sticky header             | `z-50`        | Stays above page content     |
| Select dropdown (portal)  | `z-200`       | Portaled listbox             |
| Back to top (portal)      | `z-[9999]`    | Always clickable above UI    |

## Testing Strategy

| Layer        | Tool       | Coverage                                                               |
| ------------ | ---------- | ---------------------------------------------------------------------- |
| Utilities    | Vitest     | `flightHelpers`, `searchDate`, `pagination`, `flightResultsSummary`    |
| Mock data    | Vitest     | `flightGenerator` — 30+ demo route, required fields                    |
| Redux slices | Vitest     | Search (incl. load-more append), filters, booking submit               |
| E2E          | Playwright | Book flow, empty route, API error, load more, filters, form validation |

**Totals:** 35 unit tests · 6 E2E scenarios (`pnpm test` / `pnpm test:e2e`).

E2E relies on hidden native `<select>` elements in `Select` for Playwright compatibility alongside custom dropdown UI.

## Scalability Considerations

Current architecture supports:

- **Real API** — Swap mock route; keep slice shapes and pagination params
- **Server-side filters** — Move filter query params to API; reduce client `filterFlights` scope
- **Return / multi-city** — Extend `SearchParams` and generator
- **Auth** — Add auth slice; protect POST booking
- **RTK Query** — Replace thunks for caching and deduplication

## File Conventions

- `app/` — Routes, layouts, error/not-found, API handlers
- `components/page/` — Page-level client orchestrators
- `components/search/` / `booking/` / `common/` / `ui/` / `layout/` — Feature UI (`common/` includes status panels + `BackToTop`)
- `lib/mock/` — Mock catalog and search-time transforms
- `lib/store/` — Redux store and slices
- `lib/utils/` — Pure helpers (no React)
- `data/` — Static reference data + optional JSON export
- `tests/unit/` — Vitest
- `tests/playwright/` — E2E specs

## Future Improvements

If extending beyond the take-home scope:

1. **Server-side filtering** — Pass filter params to API so counts reflect the full dataset, not loaded pages
2. **RTK Query** — Cache search pages and reduce manual thunk boilerplate
3. **Return trips / multi-city** — Extend `SearchParams` and booking routes
4. **Authentication** — Protect booking POST and persist user profile
5. **Accessibility** — Full keyboard navigation for custom `Select` listbox
6. **Analytics & monitoring** — Track search funnel and API error rates

These were intentionally deferred to keep the submission focused on search → filter → book fundamentals within the 4–8 hour guidance.
