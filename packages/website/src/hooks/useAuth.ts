import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'

import { setHeadless } from '../store/reducers/auth.reducer'
import { stats } from '@/structures/StatsManager'

export const useAuthState = (): RootState['auth'] =>
  useSelector((state: RootState) => state.auth)

export const useHeadless = () => {
  const dispatch = useDispatch()
  const { headless } = useAuthState()

  useEffect(() => {
    dispatch(setHeadless(stats.headless))
  }, [])

  return [headless] as const
}

export const useLoginState = () => {
  const { loginState } = useAuthState()

  return [loginState] as const
}
