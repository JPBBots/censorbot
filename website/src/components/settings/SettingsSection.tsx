import Router from 'next/router'
import React, { PropsWithChildren } from 'react'
import Link from 'next/link'
import { DataContext, LoginState } from 'structures/Api'
import { GuildData } from 'typings'
import { api } from 'pages/_app'
import { LoginButton } from '~/button/LoginButton'
import { Snowflake } from 'discord-api-types'

import styles from './SettingsSection.module.scss'

import { HStack, VStack, Text } from '@chakra-ui/react'

interface Section {
  name: string
  href?: string
  icon?: string
  premium?: boolean
  miniText?: string
  sections?: Section[]
}

const sections: Section[] = [
  {
    name: 'Filter',
    sections: [
      { name: 'General', href: '/filter', icon: '' },
      { name: 'Exceptions', href: '/filter/exceptions', icon: '' },
      { name: 'Extras', href: '/filter/extras', icon: '' },
      { name: 'AI', href: '/filter/ai', icon: '', premium: true }
    ]
  },
  {
    name: 'General',
    sections: [
      { name: 'Punishments', href: '/general/punishments', icon: '' },
      { name: 'Bot', href: '/general/bot', icon: '' }
    ]
  },
  {
    name: 'Other',
    sections: [
      { name: 'Resend', href: '/other/resend', icon: '', premium: true },
      { name: 'Response', href: '/other/response', icon: '', miniText: 'Popup' }
    ]
  }
]

export function SettingsSectionElement ({ children, ctx }: PropsWithChildren<{ ctx: React.ContextType<typeof DataContext> }>) {
  const currentSection = sections.map(x => x.sections).flat().find(x => x?.href && location.href.endsWith(x.href))

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
      <HStack>
        <div className={styles.menu}>
          <div className={styles.info}>
            <h1>{ctx.currentGuild.guild.n}</h1>
          </div>
          <div className={styles.sections}>
            {sections.map(category => (
              <div key={category.name}>
                <h1>{category.name}</h1>
                {category.sections?.map(section => (
                  <Link key={section.name} href={{
                    pathname: `/dashboard/[guild]${section.href}`,
                    query: Router.query
                  }}>
                    <h5>{section.name}</h5>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <VStack padding="20px" alignSelf="end" w="full">
          <Text textStyle="heading.xl">{currentSection?.name}</Text>
          {children}
        </VStack>
      </HStack>
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

  get premium () {
    return this.context.currentGuild?.premium ?? false
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
