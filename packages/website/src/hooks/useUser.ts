import { useEffect, useState } from 'react'

import { Api } from '@/structures/Api'

import { User } from '@censorbot/typings'

import { useLoginState } from './useAuth'

import { RootState } from '@/store'
import { LoginState, setLoginState } from '@/store/reducers/auth.reducer'
import { setCurrentGuild } from '@/store/reducers/guild.reducer'
import { setGuilds, setUser } from '@/store/reducers/user.reducer'

import { useDispatch, useSelector } from 'react-redux'

export const useUserState = (): RootState['user'] =>
  useSelector((state: RootState) => state.user)

let requestingUser = false

export const useUser = (needsUser: boolean) => {
  const dispatch = useDispatch()
  const { user } = useUserState()
  const [loginState] = useLoginState()
  const [emailWaiting, setEmailWaiting] = useState<0 | 1 | string>(0)

  useEffect(() => {
    void goUser(needsUser)
  }, [needsUser])

  const goUser = async (needsUser: boolean): Promise<User | undefined> => {
    if (user) return user

    if (!Api.token && !needsUser)
      return void dispatch(setLoginState(LoginState.LoggedOut))

    if (loginState !== LoginState.LoggingIn) {
      if (requestingUser) return undefined
      requestingUser = true

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
          requestingUser = false
        })
    }
  }

  useEffect(() => {
    if (emailWaiting === 1 && user) {
      if (user.email) setEmailWaiting(user.email)
    } else {
      setEmailWaiting(0)
    }

    return () => {
      setEmailWaiting(0)
    }
  }, [user])

  return {
    user,
    login: () => {
      void goUser(true)
    },
    getEmail: async () => {
      let eUser = user
      if (!user) eUser = await goUser(true)!

      if (eUser!.email) {
        setEmailWaiting(eUser!.email)

        return
      }

      const win = Api.login(true)
      await win.wait()

      setEmailWaiting(1)
    },
    emailWaiting,
    logout: () => {
      Api.logout()
      dispatch(setUser(undefined))
      dispatch(setGuilds(undefined))
      dispatch(setCurrentGuild(undefined))
    }
  } as const
}

let requestingGuilds = false

export const useGuilds = () => {
  const dispatch = useDispatch()
  const { guilds } = useUserState()
  const [loginState] = useLoginState()
  const { user } = useUser(true)

  useEffect(() => {
    if (!guilds && !requestingGuilds && user) {
      if (loginState === LoginState.LoggedIn) {
        requestingGuilds = true
        Api.getGuilds()
          .then((res) => {
            if (!res) return

            dispatch(setGuilds(res))
          })
          .catch(() => {})
          .finally(() => {
            requestingGuilds = false
          })
      }
    }
  }, [user, loginState])

  return [guilds] as const
}
