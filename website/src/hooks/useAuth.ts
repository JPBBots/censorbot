import { useDispatch, useSelector } from 'react-redux'
import { Api } from 'structures/NewApi'
import { User } from 'typings'
import { RootState } from '../store'

import { LoginState, setLoginState, setUser } from '../store/reducers/auth.reducer'

export const useAuthState = (): RootState['auth'] => useSelector((state: RootState) => state.auth)

export const useUser = (needsUser: boolean) => {
  const dispatch = useDispatch()
  const { user, loginState } = useAuthState()

  const goUser = async (ret: boolean = false): Promise<User|undefined> => {
    if (user) return user
    if (!Api.token && !ret) {
      dispatch(setLoginState(LoginState.LoggedOut))

      return
    }

    if (loginState !== LoginState.LoggingIn) {
      dispatch(setLoginState(LoginState.LoggingIn))

      return await (Api.token ? Api.getUser() : Api.login()).then(user => {
        console.log({ user })
        if (!user) throw new Error()

        dispatch(setUser(user))
        dispatch(setLoginState(LoginState.LoggedIn))

        return user
      }).catch(() => {
        if (needsUser) return goUser()

        console.log('no user')

        dispatch(setLoginState(LoginState.LoggedOut))

        return undefined
      })
    }
  }

  if ('window' in global && !user) {
    void goUser()
  }

  return [
    user,
    () => {
      void goUser(true)
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
