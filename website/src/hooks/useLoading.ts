import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from 'store/reducers/loading.reducer'
import { RootState } from '../store'

export const useLoadingState = (): RootState['loading'] => useSelector((state: RootState) => state.loading)

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
