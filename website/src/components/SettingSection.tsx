import Router from 'next/router'
import React from 'react'
import { DataContext, LoginState } from 'structures/Api'
import { api } from 'pages/_app'
import { Snowflake } from 'discord-api-types'

import { HStack, VStack, Text, Divider } from '@chakra-ui/react'
import { Sidebar, sections, SectionName } from './settings/Sidebar'
import { LoginButton } from './button/LoginButton'
import { GuildData } from 'typings'
import { FormikHelpers } from 'formik'

export const handleFormikSubmit = (value: any, helpers: FormikHelpers<any>) => {
  if (!api.data.currentGuild) return

  const db = api.data.currentGuild?.db
  if (!db) return

  const old = { ...db }

  api.setData({ currentGuild: api._createUpdatedGuild(api.data.currentGuild, value) })

  void api.changeSettings(Router.query.guild as Snowflake, value).catch(() => {
    if (!api.data.currentGuild) return

    api.setData({ currentGuild: api._createUpdatedGuild(api.data.currentGuild, old) })
    for (const key in value) {
      value[key] = api.data.currentGuild.db[key as keyof CB.Data['currentGuild']]
    }
    helpers.setValues(value)
  })
}

export class SettingSection extends React.Component<{ children: (guild: GuildData) => JSX.Element, section: SectionName}> {
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
          <VStack padding="8px 20px" alignSelf="end" w="full" h="93vh">
            <Text textStyle="heading.xl" alignSelf="start">{currentSection?.name}</Text>
            <Divider color="lighter.5" />
            <VStack w="full" overflowY="scroll">
              {this.props.children(data.currentGuild)}
            </VStack>
          </VStack>
        </HStack>
      </div>
    )
  }
}
SettingSection.contextType = DataContext
