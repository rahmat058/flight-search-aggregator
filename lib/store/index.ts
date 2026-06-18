import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slices/searchSlice'
import filtersReducer from './slices/filtersSlice'
import bookingReducer from './slices/bookingSlice'

export const makeStore = () =>
  configureStore({
    reducer: {
      search: searchReducer,
      filters: filtersReducer,
      booking: bookingReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
