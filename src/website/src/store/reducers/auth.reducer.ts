import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Snowflake } from 'discord-api-types/v9'
import { User } from '@censorbot/typings'

export enum LoginState {
  Loading = 0,
  LoggedOut,
  LoggingIn,
  LoggedIn
}

export interface AuthContextType {
  user?: User
  loginState: LoginState
  headless: boolean
}

const initialState: AuthContextType = {
  loginState: LoginState.Loading,
  headless: false
}

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
    setHeadless: (state, action: PayloadAction<boolean>) => {
      state.headless = action.payload
    }
  }
})

export const authReducer = slice.reducer
export const { setUser, setPremiumGuilds, setLoginState, setHeadless } =
  slice.actions
