import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { BookingDetails, BookingPassenger, Flight } from '@/lib/types/flight'

interface BookingState {
  selectedFlight: Flight | null
  passenger: BookingPassenger
  booking: BookingDetails | null
  status: 'idle' | 'submitting' | 'succeeded' | 'failed'
  error: string | null
  validationErrors: Partial<Record<keyof BookingPassenger, string>>
}

const emptyPassenger: BookingPassenger = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

const initialState: BookingState = {
  selectedFlight: null,
  passenger: emptyPassenger,
  booking: null,
  status: 'idle',
  error: null,
  validationErrors: {},
}

export const submitBooking = createAsyncThunk(
  'booking/submitBooking',
  async ({ flight, passenger }: { flight: Flight; passenger: BookingPassenger }, { rejectWithValue }) => {
    const response = await fetch('/api/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flightId: flight.id, passenger }),
    })
    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error ?? 'Booking failed')
    }

    return {
      bookingReference: data.bookingReference as string,
      flight: data.flight as Flight,
      passenger: data.passenger as BookingPassenger,
      bookedAt: data.bookedAt as string,
    }
  },
)

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedFlight(state, action: PayloadAction<Flight>) {
      state.selectedFlight = action.payload
      state.validationErrors = {}
      state.error = null
    },
    updatePassenger(state, action: PayloadAction<Partial<BookingPassenger>>) {
      state.passenger = { ...state.passenger, ...action.payload }
      const key = Object.keys(action.payload)[0] as keyof BookingPassenger
      if (key && state.validationErrors[key]) {
        delete state.validationErrors[key]
      }
    },
    setValidationErrors(state, action: PayloadAction<BookingState['validationErrors']>) {
      state.validationErrors = action.payload
    },
    clearSelectedFlight(state) {
      state.selectedFlight = null
      state.validationErrors = {}
      state.error = null
    },
    resetBookingFlow(state) {
      state.selectedFlight = null
      state.passenger = emptyPassenger
      state.booking = null
      state.status = 'idle'
      state.error = null
      state.validationErrors = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitBooking.pending, (state) => {
        state.status = 'submitting'
        state.error = null
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.booking = {
          ...action.payload.passenger,
          bookingReference: action.payload.bookingReference,
          bookedAt: action.payload.bookedAt,
        }
        state.selectedFlight = action.payload.flight
        state.passenger = action.payload.passenger
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Booking failed'
      })
  },
})

export const {
  setSelectedFlight,
  updatePassenger,
  setValidationErrors,
  clearSelectedFlight,
  resetBookingFlow,
} = bookingSlice.actions

/** @deprecated Use setSelectedFlight */
export const selectFlight = setSelectedFlight

export default bookingSlice.reducer
