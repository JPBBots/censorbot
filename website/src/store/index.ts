import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from './reducers/auth.reducer'
import { guildsReducer } from './reducers/guilds.reducer'

const reducer = {
  auth: authReducer,
  guilds: guildsReducer
} as const

export type PreloadStore = typeof reducer

export const store = configureStore({
  reducer
})

export type RootState = ReturnType<typeof store['getState']>