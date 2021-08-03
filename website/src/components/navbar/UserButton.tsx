import { useLoginState, useUser } from 'hooks/useAuth'

import React from 'react'

import { LoginState } from 'structures/Api'

import { NavButton } from '~/button/NavButton'

export function UserButton () {
  const [user, login] = useUser(false)
  const [loginState] = useLoginState()

  if (loginState === LoginState.Loading || loginState === LoginState.LoggingIn) return (<></>)

  if (user) {
    return (
      <NavButton href="/" special="on">
        {user.tag}
      </NavButton>
    )
  }

  return (
    <NavButton onClick={(() => {
      void login()
    })}
    special="on">Login</NavButton>
  )
}
