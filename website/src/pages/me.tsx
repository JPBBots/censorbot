import React from 'react'
import { DataContext, LoginState } from 'structures/Api'
import { LoginButton } from '~/button/LoginButton'
import { api } from './_app'

import styles from './me.module.scss'

export default class Me extends React.Component {
  context!: React.ContextType<typeof DataContext>

  componentDidMount () {
    if (!this.context.user) void api.login()
  }

  render () {
    if (!this.context.user) {
      return (
        <div className={styles.page}>
          <h1>Me Page</h1>
          {
            this.context.login === LoginState.Loading || this.context.login === LoginState.LoggingIn
              ? <h1>Logging in...</h1>
              : <LoginButton />
          }
        </div>
      )
    }

    return (
      <div className={styles.page}>
        <h1>{this.context.user.tag}</h1>
        <img className={styles.avatar} src={
          this.context.user.avatar
            ? `https://cdn.discordapp.com/avatars/${this.context.user.id}/${this.context.user.avatar}`
            : `https://cdn.discordapp.com/embed/avatars/${Number(this.context.user.tag.split('#')[1]) % 5}.png`
        }></img>
      </div>
    )
  }
}
Me.contextType = DataContext
