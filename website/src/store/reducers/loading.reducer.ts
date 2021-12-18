import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: boolean = true

const slice = createSlice({
  name: 'loading',
  initialState: initialState,
  reducers: {
    setLoading(state, payload: PayloadAction<boolean>) {
      state = payload.payload

      return state
    }
  }
})

export const loadingReducer = slice.reducer
export const { setLoading } = slice.actions
