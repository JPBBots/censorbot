import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentGuild, setGuilds } from 'store/reducers/guilds.reducer'
import { Api } from 'structures/Api'
import { User } from 'typings'
import { RootState } from '../store'

import {
  LoginState,
  setLoginState,
  setUser,
  setHeadless
} from '../store/reducers/auth.reducer'
import { stats } from '@/structures/StatsManager'

import headlessData from '../structures/headlessData.json'

export const useAuthState = (): RootState['auth'] =>
  useSelector((state: RootState) => state.auth)

let requesting = false

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

export const useUser = (needsUser: boolean) => {
  const dispatch = useDispatch()
  const { user, loginState } = useAuthState()

  useEffect(() => {
    void goUser(needsUser)
  }, [needsUser])

  const goUser = async (needsUser: boolean): Promise<User | undefined> => {
    if (user) return user

    if (!Api.token && !needsUser)
      return void dispatch(setLoginState(LoginState.LoggedOut))

    if (loginState !== LoginState.LoggingIn) {
      if (requesting) return undefined
      requesting = true

      dispatch(setLoginState(LoginState.LoggingIn))

      return await Api.getUser()
        .then((user) => {
          dispatch(setUser(user))
          dispatch(setLoginState(LoginState.LoggedIn))

          return user
        })
        .catch(() => {
          dispatch(setLoginState(LoginState.LoggedOut))
          Api.logout(false)

          return undefined
        })
        .finally(() => {
          requesting = false
        })
    }
  }

  return {
    user,
    login: () => {
      void goUser(true)
    },
    getEmail: async () => {
      if (user?.email) return user.email

      const win = Api.login(true)

      await win.wait()

      const newUser = await goUser(true)

      if (newUser?.email) return newUser.email

      throw new Error('Could not retrieve email')
    },
    logout: () => {
      Api.logout()
      dispatch(setUser(undefined))
      dispatch(setGuilds(undefined))
      dispatch(setCurrentGuild(undefined))
    }
  } as const
}

export const useLoginState = () => {
  const { loginState } = useAuthState()

  return [loginState] as const
}

// export const useGuilds = () => {
//   const dispatch = useDispatch()
//   const { } = use
// }