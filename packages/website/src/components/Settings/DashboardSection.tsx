import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'

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
  InputLeftAddon,
  Button,
  Center,
  Spinner
} from '@chakra-ui/react'
import { Aside, sections, SectionName } from './Aside'
import { LoginButton } from '../button/LoginButton'
import { useLoginState } from 'hooks/useAuth'
import { useGuild } from '@/hooks/useGuild'
import { LoginState } from 'store/reducers/auth.reducer'

import { FaBars, FaSearch, FaAngleLeft } from 'react-icons/fa'
import { sectionSettings, Setting } from './Setting'
import { searcher } from './settings'
import { wLT } from '@jpbbots/theme'
import { NeedsInvite } from '~/NeedsInvite'

import NextLink from 'next/link'
import { useGuilds, useUser } from '@/hooks/useUser'

interface DashboardSectionProps extends PropsWithChildren<{}> {
  description?: string
  section: SectionName | 'Premium'
  disableSearch?: boolean
}

export function DashboardSection(props: DashboardSectionProps) {
  useUser(true)
  const { currentGuild, needsInvite, offlineInShard, id: guildId } = useGuild()
  const [guilds] = useGuilds()
  const [loginState] = useLoginState()
  const mobiled = wLT(980)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!menuOpen && searchTerm === '') {
      searchRef.current?.focus()
    }
  }, [menuOpen, searchTerm])

  const currentSection = sections.find((x) => x.name === props.section)

  if (offlineInShard) {
    return (
      <VStack p="16px">
        <Box alignSelf="flex-start">
          <NextLink href="/dashboard">
            <Button>
              <Icon as={FaAngleLeft} fontSize="25px" mr="5px" />
              Go Back
            </Button>
          </NextLink>
        </Box>
        <Center>
          <VStack>
            <Text textStyle="heading.xl" color="brand.100">
              Censor Bot is experiencing some issues
            </Text>
            <Text textStyle="heading.lg">Check back in a bit</Text>
            <NextLink href="/status" passHref>
              <Button variant="brand">Check status</Button>
            </NextLink>
          </VStack>
        </Center>
      </VStack>
    )
  }

  if (loginState === LoginState.LoggedOut) {
    return (
      <Center>
        <VStack>
          <Text textStyle="heading.xl">Login to access dashboard</Text>
          <LoginButton />
        </VStack>
      </Center>
    )
  }

  const selectedGuild = guilds?.find((x) => x.id === guildId)
  if (needsInvite && selectedGuild) {
    return <NeedsInvite guild={selectedGuild} />
  }

  if (
    loginState === LoginState.Loading ||
    loginState === LoginState.LoggingIn ||
    !currentGuild ||
    currentGuild.guild.id !== guildId
  ) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  const menuButton = mobiled ? (
    <Button
      onClick={() => {
        setMenuOpen(!menuOpen)
      }}
      margin="5px"
      bg="transparent"
    >
      <Icon as={FaBars} cursor="pointer" fill="lighter.20" fontSize={30} />
    </Button>
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
      overflowY="hidden"
      overflowX="hidden"
    >
      <Aside
        selected={currentSection?.name}
        premium={props.section === 'Premium'}
        opened={mobiled && menuOpen}
        mobiled={mobiled}
        onClose={() => setMenuOpen(false)}
        onSearchOpen={() => {
          setMenuOpen(false)
          setSearchTerm('')
        }}
      />
      {(!mobiled || (mobiled && !menuOpen)) && (
        <Flex flexGrow={1} maxH="100%" h="100%" overflowY="scroll">
          <VStack padding="8px 20px" w="full" h="inherit">
            <HStack justify={mobiled ? 'flex-start' : 'space-between'} w="full">
              {menuButton}
              {searchTerm === null && (
                <Text textStyle="heading.xl">{props.section}</Text>
              )}
              {!props.disableSearch && (!mobiled || searchTerm !== null) && (
                <HStack w="full" justifyContent="flex-end">
                  <InputGroup
                    w={searchTerm === null ? '400px' : 'full'}
                    maxW={searchTerm === null ? '70vw' : undefined}
                    transition="0.5s"
                  >
                    <InputLeftAddon>
                      <Icon fill="brand.100" as={FaSearch} />
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
                      ref={searchRef}
                    />
                  </InputGroup>
                </HStack>
              )}
            </HStack>
            <Divider color="lighter.5" />
            <VStack w="full" pb="20px">
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
