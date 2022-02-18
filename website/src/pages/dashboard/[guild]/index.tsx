import { useGuild, useGuilds } from '@/hooks/useGuilds'
import { Center, VStack, Text, Button } from '@chakra-ui/react'
import { NeedsInvite } from '~/NeedsInvite'
import { Loading } from '~/styling/Loading'
import Filter from './filter/index'
import NextLink from 'next/link'

export default function GuildHome() {
  const [guild, , , needsInvite, inOfflineShard, id] = useGuild()
  const [guilds] = useGuilds()

  if (inOfflineShard) {
    return (
      <Center>
        <VStack>
          <Text textStyle="heading.xl">
            Censor Bot is experiencing some issues
          </Text>
          <Text textStyle="heading.lg">Check back in a bit</Text>
          <NextLink href="/dashboard" passHref>
            <Button>Back</Button>
          </NextLink>
        </VStack>
      </Center>
    )
  }

  const selectedGuild = guilds?.find((x) => x.id === id)
  if (needsInvite && selectedGuild) {
    return <NeedsInvite guild={selectedGuild} />
  }

  if (!guild || guild.guild.id !== id) {
    return (
      <Center>
        <Loading />
      </Center>
    )
  }

  return <Filter />
}
