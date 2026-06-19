import type { RootState } from '@/lib/store'
import { FLIGHTS_PAGE_SIZE } from '@/lib/utils/pagination'
import { getSearchDateError } from '@/lib/utils/searchDate'
import type { Flight, SearchParams } from '@/lib/types/flight'
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

interface SearchMeta {
  total: number
  page: number
  limit: number
  hasMore: boolean
  origin: string
  destination: string
  date: string
  passengers: number
  airlines: string[]
  priceRange: { min: number; max: number }
}

interface SearchState {
  params: SearchParams
  flights: Flight[]
  meta: SearchMeta | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  loadMoreStatus: 'idle' | 'loading' | 'failed'
  error: string | null
  loadMoreError: string | null
}

const defaultDate = '2026-07-15'

const initialState: SearchState = {
  params: {
    origin: 'JFK',
    destination: 'LAX',
    date: defaultDate,
    passengers: 1,
  },
  flights: [],
  meta: null,
  status: 'idle',
  loadMoreStatus: 'idle',
  error: null,
  loadMoreError: null,
}

const buildSearchQuery = (params: SearchParams, page: number) => {
  const query = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    passengers: String(params.passengers),
    page: String(page),
    limit: String(FLIGHTS_PAGE_SIZE),
  })

  return query
}

const fetchFlightPage = async (params: SearchParams, page: number) => {
  const dateError = getSearchDateError(params.date)
  if (dateError) {
    throw new Error(dateError)
  }

  const response = await fetch(`/api/flights?${buildSearchQuery(params, page)}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? 'Search failed')
  }

  return {
    flights: data.flights as Flight[],
    meta: data.meta as SearchMeta,
    params,
  }
}

export const searchFlights = createAsyncThunk(
  'search/searchFlights',
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      return await fetchFlightPage(params, 1)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Search failed')
    }
  },
)

export const loadMoreFlights = createAsyncThunk(
  'search/loadMoreFlights',
  async (_, { getState, rejectWithValue }) => {
    const { search } = getState() as RootState

    if (!search.meta?.hasMore) {
      return rejectWithValue('No more flights to load')
    }

    try {
      return await fetchFlightPage(search.params, search.meta.page + 1)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load more flights')
    }
  },
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    updateSearchParams(state, action: PayloadAction<Partial<SearchParams>>) {
      state.params = { ...state.params, ...action.payload }
    },
    resetSearch(state) {
      state.flights = []
      state.meta = null
      state.status = 'idle'
      state.loadMoreStatus = 'idle'
      state.error = null
      state.loadMoreError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => {
        state.status = 'loading'
        state.loadMoreStatus = 'idle'
        state.error = null
        state.loadMoreError = null
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.flights = action.payload.flights
        state.meta = action.payload.meta
        state.params = action.payload.params
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Something went wrong'
        state.flights = []
        state.meta = null
      })
      .addCase(loadMoreFlights.pending, (state) => {
        state.loadMoreStatus = 'loading'
        state.loadMoreError = null
      })
      .addCase(loadMoreFlights.fulfilled, (state, action) => {
        state.loadMoreStatus = 'idle'
        state.flights = [...state.flights, ...action.payload.flights]
        state.meta = action.payload.meta
      })
      .addCase(loadMoreFlights.rejected, (state, action) => {
        state.loadMoreStatus = 'failed'
        state.loadMoreError = (action.payload as string) ?? 'Failed to load more flights'
      })
  },
})

export const { updateSearchParams, resetSearch } = searchSlice.actions
export default searchSlice.reducer
