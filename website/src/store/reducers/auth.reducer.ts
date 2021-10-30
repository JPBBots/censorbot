import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Snowflake } from 'discord-api-types'
import { User } from 'typings'

export enum LoginState {
  Loading = 0,
  LoggedOut,
  LoggingIn,
  LoggedIn,
}

export interface AuthContextType {
  user?: User
  loginState: LoginState
}

const initialState: AuthContextType = { loginState: LoginState.Loading }

const slice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload
    },
    setPremiumGuilds: (state, action: PayloadAction<Snowflake[]>) => {
      if (state.user?.premium) {
        state.user.premium.guilds = action.payload
      }
    },
    setLoginState: (state, action: PayloadAction<LoginState>) => {
      state.loginState = action.payload
    },
  },
})

export const authReducer = slice.reducer
export const { setUser, setPremiumGuilds, setLoginState } = slice.actions
