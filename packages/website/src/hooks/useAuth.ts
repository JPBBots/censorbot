import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setGuilds } from 'store/reducers/user.reducer'
import { RootState } from '../store'

import {
  LoginState,
  setLoginState,
  setHeadless
} from '../store/reducers/auth.reducer'
import { stats } from '@/structures/StatsManager'

import headlessData from '../structures/headlessData.json'

export const useAuthState = (): RootState['auth'] =>
  useSelector((state: RootState) => state.auth)

export const useHeadless = () => {
  const dispatch = useDispatch()
  const { headless } = useAuthState()

  useEffect(() => {
    dispatch(setHeadless(stats.headless))
  }, [])

  useEffect(() => {
    if (headless) {
      dispatch(setLoginState(LoginState.LoggedIn))
      dispatch(setGuilds(headlessData.guilds))
    }
  }, [headless])

  return [headless] as const
}

export const useLoginState = () => {
  const { loginState } = useAuthState()

  return [loginState] as const
}
