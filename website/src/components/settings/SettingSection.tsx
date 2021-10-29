import React, { PropsWithChildren, useState } from 'react'

import { HStack, VStack, Text, Divider, Flex, Box, Input, Icon } from '@chakra-ui/react'
import { Sidebar, sections, SectionName } from './Sidebar'
import { LoginButton } from '../button/LoginButton'
import { useLoginState, useUser } from 'hooks/useAuth'
import { useGuild } from 'hooks/useGuilds'
import { LoginState } from 'store/reducers/auth.reducer'
import { useRouter } from 'next/router'

import { FaBars } from 'react-icons/fa'
import { useMinWidth } from '@/hooks/useMinWidth'

interface SettingSectionProps extends PropsWithChildren<{}> {
  description?: string
  section: SectionName | 'Search' | 'Premium'
  disableSearch?: boolean
}

export function SettingSection (props: SettingSectionProps) {
  useUser(true)
  const [currentGuild] = useGuild()
  const router = useRouter()
  const [loginState] = useLoginState()
  const [mobiled] = useMinWidth(840)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const menuButton = mobiled
    ? <Icon as={FaBars} onClick={() => {
      setMenuOpen(!menuOpen)
    }} margin='10px' fontSize={30} alignSelf="flex-start" />
    : ''

  return (
    <HStack
      alignItems="start"
      flexGrow={1}
      flexShrink={1}
      w="full"
      h="100%"
      maxH="100%"
      overflow="hidden">
      {(!mobiled || menuOpen) && <Sidebar
        selected={currentSection?.name}
        premium={props.section === 'Premium'}
        opened={mobiled && menuOpen}
        onClose={() => setMenuOpen(false)}
      /> }
      {(!mobiled || (mobiled && !menuOpen)) && <Flex
        flexGrow={1}
        maxH="100%"
        h="100%"
        overflowY="scroll">
        <VStack
          padding="8px 20px"
          alignSelf="end"
          w="full"
          h="inherit">
            {!props.disableSearch && <Box w="full">
              {menuButton}
              <Input
                w="400px"
                maxW="70vw"
                placeholder="Search for..."
                onClick={() => {
                  void router.push({
                    pathname: '/dashboard/[guild]/search',
                    query: router.query
                  })
                }} />
            </Box>}
          <Text
            textStyle="heading.xl"
            alignSelf="start">
              {props.disableSearch && menuButton}
              {props.section}
          </Text>
          <Divider color="lighter.5" />
          <VStack
            w="full">
            {props.description &&
              <Box
                w="full" textAlign="left"
                p={1}>
                <Text>{props.description}</Text>
                <Divider color="lighter.5" />
              </Box>
            }
            {props.children}
          </VStack>
        </VStack>
      </Flex>}
    </HStack>
  )
}
