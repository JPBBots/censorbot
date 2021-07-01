import Router, { useRouter } from 'next/router'
import React, { PropsWithChildren } from 'react'
import Link from 'next/link'
import { DataContext, LoginState } from 'structures/Api'
import { GuildData } from 'typings'
import { api } from 'pages/_app'
import { LoginButton } from '~/button/LoginButton'
import { Snowflake } from 'discord-api-types'

import styles from './SettingsSection.module.scss'

export function SettingsSectionElement ({ children, ctx }: PropsWithChildren<{ ctx: React.ContextType<typeof DataContext> }>) {
  const sections = {
    General: '/',
    Filter: '/filter',
    Punishments: '/punishments'
  } as const

  if (ctx.login === LoginState.LoggedOut) {
    return <div style={{ textAlign: 'center' }}>
      <h1>Login to access dashboard</h1>
      <LoginButton />
    </div>
  }
  if (ctx.login === LoginState.Loading || ctx.login === LoginState.LoggingIn) {
    return <div style={{ textAlign: 'center' }}>
      <h1>Loading...</h1>
    </div>
  }

  if (!ctx.currentGuild) {
    return <div>
      <h1>I forget what this means</h1>
    </div>
  }

  return (
    <div>
      <div className={styles.menu}>
        <div className={styles.info}>
          <h1>{ctx.currentGuild.guild.n}</h1>
        </div>
        <div className={styles.sections}>
          {Object.keys(sections).map((section) => (
            <Link key={section} href={{
              pathname: `/dashboard/[guild]${sections[section as keyof typeof sections]}`,
              query: useRouter().query
            }}>
              <div className={styles.section}>
                {section}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        {children}
      </div>
    </div>
  )
}

export class SettingsSection extends React.Component<{ guild: GuildData|null }> {
  context!: React.ContextType<typeof DataContext>

  get db () {
    return this.context.currentGuild?.db
  }

  get guild () {
    return this.context.currentGuild?.guild
  }

  updateGuild () {
    if (this.context.currentGuild?.guild.i === Router.query.guild) return

    void api.updateGuild(Router.query.guild as Snowflake)
  }

  componentDidMount () {
    Router.events.on('routeChangeComplete', () => {
      if (Router.query.guild) this.updateGuild()
    })
    if (Router.query.guild) this.updateGuild()
  }
}

SettingsSection.contextType = DataContext
