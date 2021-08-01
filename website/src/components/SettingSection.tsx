import Router from 'next/router'
import React from 'react'
import { DataContext, LoginState } from 'structures/Api'
import { api } from 'pages/_app'
import { Snowflake } from 'discord-api-types'

import { HStack, VStack, Text, Divider } from '@chakra-ui/react'
import { Sidebar, sections, SectionName } from './settings/Sidebar'
import { LoginButton } from './button/LoginButton'
import { GuildDB } from 'typings'

export class SettingSection extends React.Component<{ children: (db: GuildDB) => JSX.Element, section: SectionName}> {
  context!: CB.Context

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

  render () {
    const data = this.context
    const currentSection = sections.find(x => x.name === this.props.section)

    if (data.login === LoginState.LoggedOut) {
      return <div style={{ textAlign: 'center' }}>
        <h1>Login to access dashboard</h1>
        <LoginButton />
      </div>
    }
    if (data.login === LoginState.Loading || data.login === LoginState.LoggingIn) {
      return <div style={{ textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    }

    if (!data.currentGuild) {
      return <div>
        <h1>I forget what this means</h1>
      </div>
    }

    return (
      <div>
        <HStack alignItems="start">
          <Sidebar selected={currentSection?.name} />
          <VStack padding="30px" alignSelf="end" w="full" h="93vh">
            <Text textStyle="heading.xl" alignSelf="start">{currentSection?.name}</Text>
            <Divider color="lighter.5" />
            <VStack w="full" overflowY="scroll">
              {this.props.children(data.currentGuild.db)}
            </VStack>
          </VStack>
        </HStack>
      </div>
    )
  }
}
SettingSection.contextType = DataContext
