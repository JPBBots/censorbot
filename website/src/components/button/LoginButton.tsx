import { useUser } from 'hooks/useAuth'
import { MainButton } from './MainButton'

export function LoginButton ({ name = 'Login' }: { name?: string }) {
  const [, login] = useUser(false)

  return (
    <MainButton onClick={(() => {
      void login()
    })}>{name}</MainButton>
  )
}
