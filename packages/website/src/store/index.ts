import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from './reducers/auth.reducer'
import { guildReducer } from './reducers/guild.reducer'
import { loadingReducer } from './reducers/loading.reducer'
import { userReducer } from './reducers/user.reducer'

const reducer = {
  auth: authReducer,
  loading: loadingReducer,
  user: userReducer,
  guild: guildReducer
} as const

export type PreloadStore = typeof reducer

export const store = configureStore({
  reducer
})

export type RootState = ReturnType<(typeof store)['getState']>
