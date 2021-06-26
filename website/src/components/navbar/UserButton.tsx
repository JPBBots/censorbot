import { api } from 'pages/_app'

import React from 'react'

import { DataContext } from 'structures/Api'

import { NavButton } from '~/button/NavButton'

export function UserButton () {
  const { user } = React.useContext(DataContext)
  const [hovering, setHovering] = React.useState(false)

  return (
    <NavButton onClick={(() => {
      if (user) void api.logout()
      else void api.login()
    })}
    onMouseEnter={(() => {
      setHovering(true)
    })}
    onMouseLeave={(() => {
      setHovering(false)
    })}
    style={{
      backgroundColor: hovering && user ? 'var(--brand)' : '',
      color: hovering && user ? 'black' : ''
    }}
    special="on">{user?.tag ?? 'Login'}</NavButton>
  )
}
