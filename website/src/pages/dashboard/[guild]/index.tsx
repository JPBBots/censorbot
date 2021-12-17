import { useGuild, useGuilds } from '@/hooks/useGuilds'
import { Utils } from '@/utils/Utils'
import { Center, HStack, VStack, Text, Button } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/spinner'
import { useRouter } from 'next/router'
import Filter from './filter/index'

export default function GuildHome() {
  const [guild, , , needsInvite, id, updateGuild] = useGuild()
  const [guilds] = useGuilds()
  const router = useRouter()

  const inviteBot = (admin: boolean = false) => {
    Utils.openWindow(`/invite?id=${id}&admin=${admin}`, 'Invite the bot').then(
      () => updateGuild()
    )
  }

  if (needsInvite) {
    const selectedGuild = guilds?.find((x) => x.id === id)
    return (
      <Center>
        <VStack>
          <Text textStyle="heading.xl">
            Censor Bot is not in {selectedGuild?.name}
          </Text>
          <Text textStyle="heading.lg">Invite it to get started:</Text>
          <HStack>
            <Button onClick={() => inviteBot(true)}>As admin</Button>
            <Button onClick={() => inviteBot()}>Only needed permissions</Button>
          </HStack>
          <Button
            onClick={() => {
              router.push('/dashboard')
            }}
          >
            Back
          </Button>
        </VStack>
      </Center>
    )
  }

  if (!guild || guild.guild.id !== id) {
    return (
      <Center>
        <Spinner w="100px" h="100px" />
      </Center>
    )
  }

  return <Filter />
}
