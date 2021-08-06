import { useLoginState, useUser } from 'hooks/useAuth'
import { useGuilds } from 'hooks/useGuilds'
import React from 'react'
import { LoginState } from 'structures/Api'

import { LoginButton } from '~/button/LoginButton'
import { GuildCard } from '~/dashboard/GuildCard'
import { MidContainer } from '~/styling/MidContainer'

import styles from './index.module.scss'

export default function DashboardHome () {
  useUser(true)
  const [loginState] = useLoginState()
  const [guilds] = useGuilds()

  const login = !guilds
    ? loginState === LoginState.Loading || loginState === LoginState.LoggingIn
      ? <h1>Logging in...</h1>
      : loginState === LoginState.LoggedIn
        ? <h1>Loading...</h1>
        : <LoginButton />
    : null

  return (
      <MidContainer>
        <div className={styles.headerDiv}>
          <h1>Discord Dashboard</h1>
          <br />
          {login}
        </div>
        <div className={styles.guilds}>
          {
            guilds?.map(x => <GuildCard key={x.i} {...x} />)
          }
        </div>
      </MidContainer>
  )
}
