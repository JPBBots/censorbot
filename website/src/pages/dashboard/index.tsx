import { HStack, Text, VStack } from '@chakra-ui/layout'
import { useLoginState, useUser } from 'hooks/useAuth'
import { useGuilds } from 'hooks/useGuilds'
import React from 'react'
import { LoginState } from 'structures/Api'

import { LoginButton } from '~/button/LoginButton'

import { GuildPreview } from '@jpbbots/censorbot-components'
import { useRouter } from 'next/router'

export default function DashboardHome () {
  useUser(true)
  const [loginState] = useLoginState()
  const [guilds] = useGuilds()
  const router = useRouter()

  return (
      <VStack justify="center" padding={3}>
        <VStack>
          <Text textStyle="heading.xl">Discord Dashboard</Text>
          <br />
          {
            (loginState === LoginState.Loading || loginState === LoginState.LoggingIn) &&
              <Text textStyle='heading.md'>
                Logging in...
              </Text>
          }
          {
            loginState === LoginState.LoggedIn && !guilds &&
              <Text textStyle="heading.md">Loading...</Text>
          }
          {
            loginState === LoginState.LoggedOut &&
              <LoginButton />
          }
        </VStack>
        <HStack spacing={4} justify="center" wrap='wrap' gridGap='5px'>
          {
            guilds?.map(guild =>
              <GuildPreview
                key={guild.i}
                guild={{
                  name: guild.n,
                  iconUrl: guild.a ? `https://cdn.discordapp.com/icons/${guild.i}/${guild.a}.png` : undefined
                }}
                onClick={() => {
                  void router.push({
                    pathname: '/dashboard/[guild]',
                    query: {
                      guild: guild.i
                    }
                  })
                }}
              />
            )
          }
        </HStack>
      </VStack>
  )
}
