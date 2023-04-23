import { RootState } from '../store'
import { setLoading } from 'store/reducers/loading.reducer'

import { useDispatch, useSelector } from 'react-redux'

export const useLoadingState = (): RootState['loading'] =>
  useSelector((state: RootState) => state.loading)

export const useLoading = () => {
  const dispatch = useDispatch()
  const loading = useLoadingState()

  return [
    loading,
    (newLoadingState: boolean) => {
      dispatch(setLoading(newLoadingState))
    }
  ]
}
