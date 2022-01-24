import { RootState } from '@/store'
import { useSelector } from 'react-redux'

export const useMetaState = (): RootState['meta'] =>
  useSelector((state: RootState) => state.meta)

export const useServerCount = () => {
  const { serverCount } = useMetaState()

  return [serverCount] as const
}
