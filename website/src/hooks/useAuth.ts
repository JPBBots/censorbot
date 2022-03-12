import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentGuild, setGuilds } from 'store/reducers/guilds.reducer'
import { Api } from 'structures/Api'
import { User } from '@jpbbots/cb-typings'
import { RootState } from '../store'

import {
  LoginState,
  setLoginState,
  setUser,
  setHeadless
} from '../store/reducers/auth.reducer'
import { stats } from '@/structures/StatsManager'

import headlessData from '../structures/headlessData.json'
import Swal from 'sweetalert2'

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
      dispatch(setUser(headlessData.user))
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
  }, [])

  const goUser = async (
    ret: boolean = false,
    email?: boolean
  ): Promise<User | undefined> => {
    if (user && !email) return user

    if (!Api.token && !ret) {
      dispatch(setLoginState(LoginState.LoggedOut))

      return
    }

    if (loginState !== LoginState.LoggingIn) {
      if (requesting) return undefined
      requesting = true

      dispatch(setLoginState(LoginState.LoggingIn))

      return await (Api.token && !email
        ? Api.getUser()
        : Api.login(needsUser, email)
      )
        .then((user) => {
          if (!user) throw new Error()

          Swal.close({ isDismissed: true, isConfirmed: false, isDenied: false })

          dispatch(setUser(user))
          dispatch(setLoginState(LoginState.LoggedIn))

          return user
        })
        .catch(() => {
          if (needsUser) return goUser()

          dispatch(setLoginState(LoginState.LoggedOut))

          return undefined
        })
        .finally(() => {
          requesting = false
        })
    }
  }

  return [
    user,
    (email?: boolean) => {
      void goUser(true, email)
    },
    () => {
      Api.logout()
      dispatch(setUser(undefined))
      dispatch(setGuilds(undefined))
      dispatch(setCurrentGuild(undefined))
    }
  ] as const
}

export const useLoginState = () => {
  const { loginState } = useAuthState()

  return [loginState] as const
}

// export const useGuilds = () => {
//   const dispatch = useDispatch()
//   const { } = use
// }
