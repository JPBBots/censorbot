import { api } from 'pages/_app'
import { MainButton } from './MainButton'

export function LoginButton ({ name = 'Login' }: { name?: string }) {
  return (
    <MainButton onClick={(() => {
      void api.login()
    })}>{name}</MainButton>
  )
}
