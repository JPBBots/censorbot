import React from 'react'

import { HStack, VStack, Text, Divider } from '@chakra-ui/react'
import { Sidebar, sections, SectionName } from './Sidebar'
import { LoginButton } from '../button/LoginButton'
import { GuildData, GuildDB } from 'typings'
import { useLoginState, useUser } from 'hooks/useAuth'
import { useGuild } from 'hooks/useGuilds'
import { LoginState } from 'store/reducers/auth.reducer'
import { DeepPartial } from 'redux'
import { FormikHelpers } from 'formik'

interface SettingSectionProps {
  children: (
    guild: GuildData,
    setDb: (db: DeepPartial<GuildDB>) => Promise<any>,
    formikSubmitHandler: (value: any, helpers: FormikHelpers<any>) => Promise<any>
  ) => JSX.Element
  section: SectionName
}

export function SettingSection (props: SettingSectionProps) {
  useUser(true)
  const [currentGuild, setDb, formikSubmitHandler] = useGuild()
  const [loginState] = useLoginState()

  const currentSection = sections.find(x => x.name === props.section)

  if (loginState === LoginState.LoggedOut) {
    return <div style={{ textAlign: 'center' }}>
        <h1>Login to access dashboard</h1>
        <LoginButton />
      </div>
  }
  if (loginState === LoginState.Loading || loginState === LoginState.LoggingIn) {
    return <div style={{ textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
  }

  if (!currentGuild) {
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
              {props.children(currentGuild, setDb, formikSubmitHandler)}
            </VStack>
          </VStack>
        </HStack>
      </div>
  )
}
