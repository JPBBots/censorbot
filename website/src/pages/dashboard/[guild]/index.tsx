import { ShortGuild } from '@/../../typings/api'
import { useGuild, useGuilds } from '@/hooks/useGuilds'
import { store } from '@/store'
import { setGuilds } from '@/store/reducers/guilds.reducer'
import { Utils } from '@/utils/Utils'
import { Center, HStack, VStack, Text, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Loading } from '~/styling/Loading'
import Filter from './filter/index'

export default function GuildHome() {
  const [guild, , , needsInvite, id, updateGuild] = useGuild()
  const [guilds] = useGuilds()
  const router = useRouter()

  const inviteBot = (admin: boolean = false) => {
    void Utils.openWindow(
      `/invite?id=${id}&admin=${admin}`,
      'Invite the bot'
    ).then(() => {
      void updateGuild().then((hasGuild) => {
        if (hasGuild) {
          const newGuilds: ShortGuild[] = Object.assign([], guilds)
          const g: ShortGuild = Object.assign(
            {},
            newGuilds.find((x) => x.id === hasGuild.guild.id)
          )
          if (g) {
            g.joined = true

            store.dispatch(
              setGuilds(
                newGuilds.filter((x) => x.id !== hasGuild.guild.id).concat([g])
              )
            )
          }
        }
      })
    })
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
              void router.push('/dashboard')
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
        <Loading />
      </Center>
    )
  }

  return <Filter />
}
