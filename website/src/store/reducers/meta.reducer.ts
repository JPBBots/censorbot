import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Meta {
  serverCount: number
}

const initialState: Meta = { serverCount: 60000 }

const slice = createSlice({
  name: 'meta',
  initialState: initialState,
  reducers: {
    setServerCount(state, payload: PayloadAction<number>) {
      state.serverCount = payload.payload

      return state
    }
  }
})

export const metaReducer = slice.reducer
export const { setServerCount } = slice.actions
