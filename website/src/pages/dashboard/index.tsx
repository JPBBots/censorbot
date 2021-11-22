import { Divider, HStack, Text, VStack } from '@chakra-ui/layout'
import { useLoginState, useUser } from 'hooks/useAuth'
import { useGuilds } from 'hooks/useGuilds'
import React, { useEffect, useState } from 'react'
import { LoginState } from '@/store/reducers/auth.reducer'

import { LoginButton } from '~/button/LoginButton'

import { GuildPreview } from '@jpbbots/censorbot-components'
import { useRouter } from 'next/router'
import { Input } from '@chakra-ui/input'
import { InputGroup, InputLeftAddon, Icon } from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'

import FuzzySearch from 'fuzzy-search'
import { ShortGuild } from '@/../../typings/api'
import { useMinWidth } from '@/hooks/useMinWidth'

export default function DashboardHome() {
  useUser(true)
  const [loginState] = useLoginState()
  const [guilds] = useGuilds()
  const router = useRouter()

  const [dontShowSearch] = useMinWidth(970)

  const [searcher, setSearcher] = useState<FuzzySearch<ShortGuild> | undefined>(
    undefined
  )

  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    if (guilds) setSearcher(new FuzzySearch(guilds, ['id', 'name']))
    else setSearcher(undefined)
  }, [guilds])

  return (
    <VStack padding={3}>
      <VStack w="full">
        {(loginState === LoginState.Loading ||
          loginState === LoginState.LoggingIn) && (
          <Text textStyle="heading.md">Logging in...</Text>
        )}
        {loginState === LoginState.LoggedIn && !guilds && (
          <Text textStyle="heading.md">Loading...</Text>
        )}
        {loginState === LoginState.LoggedOut && <LoginButton />}
        {loginState === LoginState.LoggedIn && guilds && (
          <>
            <HStack w="full" justify="space-between">
              <Text textStyle="heading.lg">Select a server to get started</Text>
              {!dontShowSearch && (
                <InputGroup w="350px" maxW="70vw" display="inline-flex">
                  <InputLeftAddon>
                    <Icon color="brand.100" as={FaSearch} />
                  </InputLeftAddon>

                  <Input
                    placeholder="Search servers"
                    onChange={({ target }) => {
                      setSearchTerm(target.value)
                    }}
                  />
                </InputGroup>
              )}
            </HStack>
            <Divider color="lighter.5" />
          </>
        )}
      </VStack>
      <HStack spacing={4} alignSelf="flex-start" wrap="wrap" gridGap="5px">
        {searcher?.search(searchTerm).map((guild) => (
          <GuildPreview
            key={guild.id}
            guild={{
              name: guild.name,
              iconUrl: guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : undefined
            }}
            onClick={() => {
              void router.push({
                pathname: '/dashboard/[guild]',
                query: {
                  guild: guild.id
                }
              })
            }}
          />
        ))}
      </HStack>
    </VStack>
  )
}
