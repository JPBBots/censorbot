import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ShortGuild, User } from '@censorbot/typings'

export interface UserContextType {
  guilds?: ShortGuild[]
  user?: User
}

const initialState: UserContextType = {}

const slice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setGuilds: (state, action: PayloadAction<ShortGuild[] | undefined>) => {
      state.guilds = action.payload
    },
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload
    },
    setPremiumGuilds: (state, action: PayloadAction<string[]>) => {
      if (state.user?.premium) {
        state.user.premium.guilds = action.payload
      }
    }
  }
})

export const userReducer = slice.reducer
export const { setGuilds, setUser, setPremiumGuilds } = slice.actions
