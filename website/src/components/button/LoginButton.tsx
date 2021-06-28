import { api } from 'pages/_app'
import { MainButton } from './MainButton'

export function LoginButton () {
  return (
    <MainButton onClick={(() => {
      void api.login()
    })}>Login</MainButton>
  )
}
