import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from './reducers/auth.reducer'
import { guildsReducer } from './reducers/guilds.reducer'
import { loadingReducer } from './reducers/loading.reducer'
import { metaReducer } from './reducers/meta.reducer'

const reducer = {
  auth: authReducer,
  guilds: guildsReducer,
  loading: loadingReducer,
  meta: metaReducer
} as const

export type PreloadStore = typeof reducer

export const store = configureStore({
  reducer
})

export type RootState = ReturnType<typeof store['getState']>
