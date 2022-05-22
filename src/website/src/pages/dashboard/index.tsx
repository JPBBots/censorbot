import { Divider, HStack, Text, VStack } from '@chakra-ui/layout'
import { useLoginState, useUser } from 'hooks/useAuth'
import { useGuilds } from 'hooks/useGuilds'
import React, { useEffect, useState } from 'react'
import { LoginState } from '@/store/reducers/auth.reducer'

import { LoginButton } from '~/button/LoginButton'

import { GuildPreview } from '@jpbbots/censorbot-components'
import { Input } from '@chakra-ui/input'
import {
  InputGroup,
  InputLeftAddon,
  Icon,
  Wrap,
  Spinner
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'

import NextLink from 'next/link'

import FuzzySearch from 'fuzzy-search'
import { ShortGuild } from '@censorbot/typings'
import { wMT } from '@jpbbots/theme'
import { NextSeo } from 'next-seo'

export function GuildList({
  searchTerm,
  searcher,
  filter
}: {
  searchTerm?: string
  searcher?: FuzzySearch<ShortGuild>
  filter?: (guild: ShortGuild) => boolean
}) {
  return (
    <Wrap
      alignSelf="flex-start"
      justify={{ tablet: 'flex-start', mobile: 'center' }}
      w="full"
      gridGap="15px"
    >
      {searcher
        ?.search(searchTerm)
        .filter(filter ?? (() => true))
        .map((guild) => (
          <NextLink
            key={guild.id}
            href={`/dashboard/${guild.id}`}
            passHref
            prefetch
          >
            <GuildPreview
              guild={{
                name: guild.name,
                iconUrl: guild.icon
                  ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                  : undefined
              }}
            />
          </NextLink>
        ))}
    </Wrap>
  )
}

export default function DashboardHome() {
  useUser(true)
  const [loginState] = useLoginState()
  const [guilds] = useGuilds()

  const showSearch = wMT(970)

  const [searcher, setSearcher] = useState<FuzzySearch<ShortGuild> | undefined>(
    undefined
  )

  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    if (guilds) setSearcher(new FuzzySearch(guilds, ['id', 'name']))
    else setSearcher(undefined)
  }, [guilds])

  const groups = guilds
    ? [...new Set(guilds.map((x) => x.group).filter((x) => x))]
    : undefined

  return (
    <VStack p="20px">
      <NextSeo
        title="Censor Bot Dashboard"
        description="Customize Censor Bot to your liking"
        openGraph={{
          title: 'Censor Bot Dashboard',
          description:
            'Customize & invite Censor Bot! Make it perfect for your community.'
        }}
      />
      <VStack w="full">
        {(loginState === LoginState.Loading ||
          loginState === LoginState.LoggingIn) && (
          <Text textStyle="heading.md">Logging in...</Text>
        )}
        {loginState === LoginState.LoggedIn && !guilds && <Spinner />}
        {loginState === LoginState.LoggedOut && <LoginButton />}
        {loginState === LoginState.LoggedIn && guilds && (
          <>
            <HStack w="full" justify="space-between">
              <Text textStyle={{ tablet: 'heading.lg', mobile: 'heading.sm' }}>
                Select a server to get started
              </Text>
              {showSearch && (
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
      {guilds && (
        <VStack align="left" w="full">
          <GuildList
            filter={(x) => x.joined && !x.group}
            {...{ searchTerm, searcher }}
          />
          {groups?.map((x) => (
            <>
              <Text
                align="left"
                textStyle={{ tablet: 'heading.lg', mobile: 'heading.sm' }}
              >
                {x}
              </Text>
              <Divider color="lighter.5" />
              <GuildList
                filter={(a) => a.group === x}
                {...{ searchTerm, searcher }}
              />
            </>
          ))}
          <Text
            align="left"
            textStyle={{ tablet: 'heading.lg', mobile: 'heading.sm' }}
          >
            Servers without Censor Bot
          </Text>
          <Divider color="lighter.5" />
          <GuildList filter={(x) => !x.joined} {...{ searchTerm, searcher }} />
        </VStack>
      )}
    </VStack>
  )
}
