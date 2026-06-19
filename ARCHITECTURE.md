# Architecture

## Overview

SkyRoute is a flight search and booking demo on the **Next.js App Router**. Search and results live on `/`; booking steps use **dedicated routes** keyed by flight ID, with an in-page **review sidebar** on the home screen. A mock REST API serves paginated flight data from an in-memory generator (not static JSON at runtime).

Open [http://localhost:3000](http://localhost:3000) or [https://flight-search-aggregator.vercel.app](https://flight-search-aggregator.vercel.app).

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            Browser (Client)                               │
│  ┌──────────────┐  ┌─────────────────────────┐  ┌─────────────────────┐ │
│  │  SearchForm  │  │     FlightResults        │  │   Booking routes    │ │
│  │  (home /)    │  │ Filters · Sort · Cards   │  │ /flights/[id]/      │ │
│  │              │  │ FlightBookingSidebar     │  │ book·payment·confirm│ │
│  └──────┬───────┘  └──────────┬──────────────┘  └──────────┬──────────┘ │
│         │                     │                             │            │
│         └─────────────────────┼─────────────────────────────┘            │
│                               ▼                                          │
│                   ┌───────────────────────┐                              │
│                   │  Redux Toolkit Store   │                              │
│                   │  search │ filters │    │                              │
│                   │         booking       │                              │
│                   └───────────┬───────────┘                              │
└───────────────────────────────┼──────────────────────────────────────────┘
                                │ fetch() on payment submit
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
4. **Shared status UI** — Loading, error, and empty states use reusable components in `components/common/` with Lottie animations.
5. **Reusable UI primitives** — `Button`, `Input`, `Select`, and `Checkbox` provide consistent styling (custom Tailwind, no Radix).
6. **Progressive UX** — Pagination + infinite scroll; portaled **Back to top**; slide-in booking sidebar with CSS transitions.

## App Routes

| Route                              | Component             | Role                                           |
| ---------------------------------- | --------------------- | ---------------------------------------------- |
| `/`                                | `FlightSearchApp`     | Search form + results + review sidebar         |
| `/flights/[flightId]/review`       | `BookingReview`       | Standalone review (direct URL access)          |
| `/flights/[flightId]/book`         | `BookingForm`         | Contact + passenger details (two-column)     |
| `/flights/[flightId]/payment`      | `BookingPayment`      | Payment method + fare breakdown                |
| `/flights/[flightId]/confirmation` | `BookingConfirmation` | Success screen                                 |
| `app/error.tsx`                    | Error boundary        | Unexpected render errors + message digest      |
| `app/not-found.tsx`                | 404                   | Unknown URLs                                   |

`FlightBookingGate` wraps booking pages: resolves flight by ID via `findFlightById()`, syncs Redux, redirects invalid or incomplete flows, and renders inside `CenteredMain` (`align="start"` on book/payment pages).

| Gate prop          | Behavior                                                        |
| ------------------ | --------------------------------------------------------------- |
| (default)          | Requires matching `selectedFlight`                              |
| `requirePassenger` | Redirects to `/book` if passenger fields incomplete             |
| `requireBooking`   | Redirects to `/payment` or `/book` if booking not yet submitted |

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

### `filtersSlice`

| Field                     | Purpose                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `filters.maxPrice`        | Max ticket price (null = any)                                                            |
| `filters.maxStops`        | Max stops (null = any)                                                                   |
| `filters.airlines`        | Selected airline names                                                                   |
| `filters.departureWindow` | `any` \| `early-morning` \| `morning` \| `afternoon` \| `evening` (radio card UI)        |
| `sortBy`                  | Active sort option                                                                       |

Departure windows map to UTC hour ranges in `matchesDepartureWindow()` (`lib/utils/flightHelpers.ts`).

### `bookingSlice`

| Field              | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `selectedFlight`   | Flight chosen for booking                            |
| `passenger`        | Persisted contact + passenger fields                 |
| `paymentMethod`    | Selected mock card (Amex / Visa / Mastercard)        |
| `booking`          | Confirmed booking (reference, passenger, payment)    |
| `status`           | `idle` \| `submitting` \| `succeeded` \| `failed`    |
| `validationErrors` | Legacy field errors (form uses react-hook-form)      |

**Async thunk:** `submitBooking` — `POST /api/flights` with passenger payload; stores `paymentMethod` on success; navigates to confirmation.

**Reducers:** `setSelectedFlight`, `updatePassenger`, `setPaymentMethod`, `clearSelectedFlight`, `resetBookingFlow`.

There is **no** `step` field — booking navigation is URL-based.

## Data Flow

### Search Flow

1. User edits form → `updateSearchParams`
2. User clicks Search → client validates date window → `searchFlights` (page 1)
3. API paginates matching flights → first page stored in Redux
4. `FlightResults` applies `filterFlights()` + `sortFlights()` via `useMemo`
5. User clicks **Load more**, scrolls to sentinel, or uses **Back to top** → `loadMoreFlights` appends next page
6. Header, sidebar (`filter-summary`), and pagination text use `flightResultsSummary.ts` for consistent counts

### Booking Flow

1. User clicks **Select** → `setSelectedFlight` + `FlightBookingSidebar` opens (slide-in from right)
2. **Continue to booking** → `/flights/{id}/book`
3. Valid passenger form → `updatePassenger` → `/flights/{id}/payment`
4. Terms accepted + payment method selected → `submitBooking` → `/flights/{id}/confirmation`
5. **Search for another flight** → `router.replace('/')` + `resetBookingFlow` + `resetSearch`

Passenger data is saved to Redux on the book step; the API call happens on payment submit.

## Flight Booking Sidebar

`components/booking/FlightBookingSidebar.tsx`:

- Portaled overlay at `z-10000` (above Back to top at `z-[9999]`)
- **Enter animation:** mount off-screen → `requestAnimationFrame` → CSS `transition-transform` slide in
- **Exit animation:** slide out, then unmount and `clearSelectedFlight`
- Reuses `BookingReviewDetails` for fare summary
- State machine phases: `closed` → `entering` → `open` → `exiting` → `closed`

Render-time prop sync (not `useEffect` setState) avoids React cascading-render warnings.

## Booking Pages UX

### Passenger details (`BookingForm`)

Two-column layout:

- **Left:** Contact details (phone + email), passenger card (title radio MR/MS/MRS, names, optional DOB / frequent flyer)
- **Right (sticky):** Session timer, `BookingFlightSummary`, **Continue** button
- Progress breadcrumb via `BookingProgressSteps`

### Payment (`BookingPayment`)

Two-column layout:

- **Left:** Terms checkbox, payment method cards (Amex / Visa / Mastercard from `data/paymentMethods.ts`)
- **Right (sticky):** Session timer, `BookingPaymentBreakdown`, **Proceed to payment** button

Fare breakdown computed by `buildPaymentBreakdown()` in `lib/utils/paymentBreakdown.ts` (base fare, tax, AIT & VAT, other charges, $9.75 processing fee).

### Confirmation (`BookingConfirmation`)

Shows booking reference, passenger, route, payment method (brand + last4), and total paid (including processing fee).

## Status Animations

| Component      | Asset                    | When shown                          |
| -------------- | ------------------------ | ----------------------------------- |
| `LoadingState` | `/animations/Plane.lottie` | Search in progress                  |
| `EmptyState`   | `/animations/Empty.lottie` | No API results or no filter matches |

Both use `@lottiefiles/dotlottie-react` via `DotLottieReact`.

## Mock Data Model

Implemented in `lib/mock/flightGenerator.ts`:

| Concept                     | Detail                                                          |
| --------------------------- | --------------------------------------------------------------- |
| `MOCK_FLIGHT_COUNT`         | 1000 template flights                                           |
| Routes                      | All 8×7 directed airport pairs (56 routes)                      |
| `DEMO_ROUTE_MIN_FLIGHTS`    | JFK → LAX guaranteed **30+** templates                          |
| `CANONICAL_DATE`            | `2026-07-15` — templates stored on this date                    |
| `applySearchDate()`         | Remaps departure/arrival times and IDs to the searched date     |
| `isFlightScheduledOnDate()`   | Hash-based subset on non-demo dates (~⅔ of templates)           |
| `EMPTY_ROUTE_KEYS`          | `SEA-MIA-2026-07-15` → empty (E2E)                              |
| `findFlightById()`          | Resolves template by origin/dest/index, applies date from ID    |

Mock payment cards in `data/paymentMethods.ts` — client-side only; not sent to the API.

## Pagination

| Layer               | Behavior                                                             |
| ------------------- | -------------------------------------------------------------------- |
| `FLIGHTS_PAGE_SIZE` | 3 (default)                                                          |
| API                 | `page`, `limit` query params; `paginate()` helper slices results     |
| Redux               | `searchFlights` replaces; `loadMoreFlights` appends                  |
| UI                  | `FlightResultsPagination` — button + Intersection Observer sentinel  |
| Back to top         | `BackToTop` — portaled to `document.body`, `z-[9999]`, smooth scroll |

## Filtering, Sorting & Result Copy

**Pure functions** in `lib/utils/flightHelpers.ts`:

- `filterFlights()` — price, stops, airline, departure window
- `sortFlights()` — price, duration, departure time

**Summary helpers** in `lib/utils/flightResultsSummary.ts`:

- `hasActiveFilters()`, `getResultsHeadline()`, `getFilterSidebarSummary()`, `getPaginationSummary()`

**Booking helpers** in `lib/utils/bookingHelpers.ts`:

- `isPassengerComplete()` — gate guard for payment route

## Component Hierarchy

```
RootLayout (app-bg, Header, Footer)
└── StoreProvider
    ├── Home (/)
    │   └── FlightSearchApp
    │       ├── SearchForm
    │       └── FlightResults
    │           ├── FlightSort
    │           ├── FlightFilters (departure radio cards)
    │           ├── FlightCard[]
    │           ├── FlightResultsPagination
    │           ├── BackToTop (portal → body)
    │           └── FlightBookingSidebar (portal → body)
    │
    ├── /flights/[flightId]/review
    │   └── FlightBookingGate → BookingReview
    ├── /flights/[flightId]/book
    │   └── FlightBookingGate (align start) → BookingForm
    ├── /flights/[flightId]/payment
    │   └── FlightBookingGate (requirePassenger, align start) → BookingPayment
    └── /flights/[flightId]/confirmation
        └── FlightBookingGate (requireBooking) → BookingConfirmation
```

## Mock API Design

`app/api/flights/route.ts`:

- Simulated latency: 800ms (GET), 600ms (POST)
- **GET** validates origin, destination, date window, distinct airports
- Filters by route + passenger seat availability, then paginates
- Returns full-route metadata for filter UI
- **POST** validates passenger payload, resolves flight by ID, returns `SKY…` reference

Payment method is stored client-side in Redux only — the POST body is unchanged.

## Styling

Tailwind CSS 4 with a custom design system in `app/globals.css`:

- **Gradient background** — indigo/violet/cyan layers
- **Glass cards** — frosted panels with backdrop blur
- **Font** — Roboto via `next/font`
- **Sidebar animation** — CSS `transition-transform` with `cubic-bezier(0.16, 1, 0.3, 1)`

### Z-index layers

| Layer                     | z-index    | Notes                              |
| ------------------------- | ---------- | ---------------------------------- |
| Search / results sections | `z-10`–`z-20` | Stacking for form vs results    |
| Sticky header             | `z-50`     | Stays above page content           |
| Select dropdown (portal)  | `z-200`    | Portaled listbox                   |
| Back to top (portal)      | `z-[9999]` | Above page content                 |
| Booking sidebar (portal)  | `z-10000`  | Above back-to-top and all page UI  |

## Testing Strategy

| Layer        | Tool       | Files / coverage                                                       |
| ------------ | ---------- | ---------------------------------------------------------------------- |
| Utilities    | Vitest     | `flightHelpers`, `searchDate`, `pagination`, `flightResultsSummary`, `paymentBreakdown`, `bookingHelpers` |
| Mock data    | Vitest     | `flightGenerator` — 30+ demo route, required fields                    |
| Redux slices | Vitest     | Search (load-more append), filters, booking (incl. payment method)     |
| E2E          | Playwright | Full flow, sidebar, empty states, API error, pagination, filters, form + payment validation |

**Totals:** 39 unit tests · 9 E2E scenarios (`pnpm test` / `pnpm test:e2e`).

E2E relies on hidden native `<select>` elements in `Select` for Playwright compatibility alongside custom dropdown UI.

## File Conventions

- `app/` — Routes, layouts, error/not-found, API handlers
- `components/page/` — Page-level client orchestrators
- `components/search/` / `booking/` / `common/` / `ui/` / `layout/` — Feature UI
- `lib/mock/` — Mock catalog and search-time transforms
- `lib/store/` — Redux store and slices
- `lib/utils/` — Pure helpers (no React)
- `data/` — Static reference data (airports, payment methods) + optional JSON export
- `public/animations/` — Lottie assets
- `tests/unit/` — Vitest
- `tests/playwright/` — E2E specs

## Scalability Considerations

- **Real API** — Swap mock route; keep slice shapes and pagination params
- **Payment gateway** — Replace mock cards with PSP integration; extend POST payload
- **Server-side filters** — Move filter query params to API
- **Return / multi-city** — Extend `SearchParams` and generator
- **Auth** — Add auth slice; protect POST booking
- **RTK Query** — Replace thunks for caching and deduplication
