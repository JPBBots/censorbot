import { api } from 'pages/_app'
import React from 'react'
import { DataContext, LoginState } from 'structures/Api'

import { LoginButton } from '~/button/LoginButton'
import { GuildCard } from '~/dashboard/GuildCard'

import styles from './index.module.scss'

export default class DashboardHome extends React.Component {
  context!: React.ContextType<typeof DataContext>

  componentDidMount () {
    if (!this.context.guilds) void api.updateGuilds()
  }

  render () {
    const login = !this.context.guilds
      ? this.context.login === LoginState.Loading || this.context.login === LoginState.LoggingIn
        ? <h1>Logging in...</h1>
        : <LoginButton />
      : null

    return (
      <div>
        <div className={styles.headerDiv}>
          <h1>Discord Dashboard</h1>
          <br />
          {login}
        </div>
        <div className={styles.guilds}>
          {
            this.context.guilds?.map(x => <GuildCard key={x.i} {...x} />)
          }
        </div>
      </div>
    )
  }
}
DashboardHome.contextType = DataContext
