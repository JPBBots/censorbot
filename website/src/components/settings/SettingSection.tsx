import React, { PropsWithChildren, useEffect, useState } from 'react'

import {
  HStack,
  VStack,
  Text,
  Divider,
  Flex,
  Box,
  Input,
  Icon,
  InputGroup,
  InputLeftAddon
} from '@chakra-ui/react'
import { Sidebar, sections, SectionName } from './Sidebar'
import { LoginButton } from '../button/LoginButton'
import { useLoginState, useUser } from 'hooks/useAuth'
import { useGuild } from 'hooks/useGuilds'
import { LoginState } from 'store/reducers/auth.reducer'
import { useRouter } from 'next/router'

import { FaBars, FaSearch } from 'react-icons/fa'
import { useMinWidth } from '@/hooks/useMinWidth'
import { sectionSettings, Setting } from './Setting'
import { searcher } from './settings'
import { Loading } from '~/styling/Loading'

interface SettingSectionProps extends PropsWithChildren<{}> {
  description?: string
  section: SectionName | 'Premium'
  disableSearch?: boolean
}

export function SettingSection(props: SettingSectionProps) {
  useUser(true)
  const [currentGuild] = useGuild()
  const [loginState] = useLoginState()
  const [mobiled] = useMinWidth(840)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string | null>(null)

  const currentSection = sections.find((x) => x.name === props.section)

  if (loginState === LoginState.LoggedOut) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Login to access dashboard</h1>
        <LoginButton />
      </div>
    )
  }
  if (
    loginState === LoginState.Loading ||
    loginState === LoginState.LoggingIn ||
    !currentGuild
  ) {
    return <Loading />
  }

  const menuButton = mobiled ? (
    <Icon
      as={FaBars}
      onClick={() => {
        setMenuOpen(!menuOpen)
      }}
      margin="10px"
      color="lighter.20"
      cursor="pointer"
      fontSize={30}
    />
  ) : (
    ''
  )

  return (
    <HStack
      alignItems="start"
      flexGrow={1}
      flexShrink={1}
      w="full"
      h="100%"
      maxH="100%"
      overflow="hidden"
    >
      {(!mobiled || menuOpen) && (
        <Sidebar
          selected={currentSection?.name}
          premium={props.section === 'Premium'}
          opened={mobiled && menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      )}
      {(!mobiled || (mobiled && !menuOpen)) && (
        <Flex flexGrow={1} maxH="100%" h="100%" overflowY="scroll">
          <VStack padding="8px 20px" w="full" h="inherit">
            <HStack
              flexWrap="wrap"
              justify={mobiled ? 'flex-start' : 'space-between'}
              w="full"
            >
              {menuButton}
              {searchTerm === null && (
                <Text textStyle="heading.xl" alignSelf="start">
                  {props.section}
                </Text>
              )}
              {!props.disableSearch && (
                <HStack
                  w={searchTerm === null ? undefined : 'full'}
                  _focus={{
                    transition: '0.5s'
                  }}
                  justifyContent="flex-end"
                >
                  <InputGroup
                    w={searchTerm === null ? '400px' : 'full'}
                    maxW={searchTerm === null ? '70vw' : undefined}
                    transition="0.4s"
                  >
                    <InputLeftAddon>
                      <Icon color="brand.100" as={FaSearch} />
                    </InputLeftAddon>

                    <Input
                      placeholder="Search settings..."
                      onChange={({ target }) => setSearchTerm(target.value)}
                      onFocus={() => {
                        if (!searchTerm) setSearchTerm('')
                      }}
                      onBlur={() => {
                        if (!searchTerm) setSearchTerm(null)
                      }}
                    />
                  </InputGroup>
                </HStack>
              )}
            </HStack>
            <Divider color="lighter.5" />
            <VStack w="full">
              {searchTerm === null && props.description && (
                <Box w="full" textAlign="left" p={1}>
                  <Text>{props.description}</Text>
                  <Divider color="lighter.5" />
                </Box>
              )}
              {props.children ??
                (searchTerm !== null
                  ? searcher
                      .search(searchTerm)
                      .slice(0, 10)
                      .map((x) => (
                        <Setting key={x.title ?? x.options[0].name} {...x} />
                      ))
                  : sectionSettings(props.section as any))}
            </VStack>
          </VStack>
        </Flex>
      )}
    </HStack>
  )
}
