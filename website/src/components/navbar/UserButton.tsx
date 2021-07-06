import { api } from 'pages/_app'

import React from 'react'

import { DataContext, LoginState } from 'structures/Api'

import { NavButton } from '~/button/NavButton'

export function UserButton () {
  const { user, login } = React.useContext(DataContext)

  if (login === LoginState.Loading || login === LoginState.LoggingIn) return (<></>)

  if (user) {
    return (
      <NavButton href="/" special="on">
        {user.tag}
      </NavButton>
    )
  }

  return (
    <NavButton onClick={(() => {
      void api.login()
    })}
    special="on">Login</NavButton>
  )
}
