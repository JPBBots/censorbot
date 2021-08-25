import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentGuild, setGuilds } from 'store/reducers/guilds.reducer'
import { Api } from 'structures/Api'
import { User } from 'typings'
import { RootState } from '../store'

import { LoginState, setLoginState, setUser } from '../store/reducers/auth.reducer'

export const useAuthState = (): RootState['auth'] => useSelector((state: RootState) => state.auth)

export const useUser = (needsUser: boolean) => {
  const dispatch = useDispatch()
  const { user, loginState } = useAuthState()

  useEffect(() => {
    void goUser(needsUser)
  }, [])

  const goUser = async (ret: boolean = false): Promise<User|undefined> => {
    if (user) return user
    if (!Api.token && !ret) {
      dispatch(setLoginState(LoginState.LoggedOut))

      return
    }

    if (loginState !== LoginState.LoggingIn) {
      dispatch(setLoginState(LoginState.LoggingIn))

      return await (Api.token ? Api.getUser() : Api.login(needsUser)).then(user => {
        if (!user) throw new Error()

        dispatch(setUser(user))
        dispatch(setLoginState(LoginState.LoggedIn))

        return user
      }).catch(() => {
        if (needsUser) return goUser()

        dispatch(setLoginState(LoginState.LoggedOut))

        return undefined
      })
    }
  }

  return [
    user,
    () => {
      void goUser(true)
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

  return [
    loginState
  ]
}

// export const useGuilds = () => {
//   const dispatch = useDispatch()
//   const { } = use
// }
