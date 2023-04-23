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
    setLoginState: (state, action: PayloadAction<LoginState>) => {
      state.loginState = action.payload
    },
    setHeadless: (state, action: PayloadAction<boolean>) => {
      state.headless = action.payload
    }
  }
})

export const authReducer = slice.reducer
export const { setLoginState, setHeadless } = slice.actions
