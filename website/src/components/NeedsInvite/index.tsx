import { ShortGuild } from 'typings/api'

import { FaArrowLeft } from 'react-icons/fa'

import { store } from '@/store'
import { setGuilds } from '@/store/reducers/guilds.reducer'
import { Utils } from '@/utils/Utils'

import Link from 'next/link'
import { MiddleWrap } from '~/MiddleWrap'
import { uDW } from '@/hooks/useScreenSize'

import { useGuild, useGuilds } from '@/hooks/useGuilds'

import { VStack, Box, Icon, Avatar, Button, Text } from '@chakra-ui/react'

export function NeedsInvite({ guild }: { guild: ShortGuild }) {
  const [, , , , , id, updateGuild] = useGuild()
  const [guilds] = useGuilds()

  const inviteBot = (admin: boolean) => {
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

  const align = uDW({
    tablet: 'flex-start',
    mobile: 'center'
  })

  return (
    <VStack p="16px">
      <Box alignSelf="flex-start">
        <Link href="/dashboard">
          <Icon as={FaArrowLeft} cursor="pointer" fontSize="50px" />
        </Link>
      </Box>
      <VStack>
        <MiddleWrap py="10px" spacing="8px" alignSelf={align}>
          <Avatar
            rounded="md"
            bg="lighter.5"
            fontSize="20px"
            fontWeight="500"
            alt={guild.name}
            name={guild.name}
            boxSize="48px"
            src={
              guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : undefined
            }
            color="lighter.100"
            sx={{
              img: {
                rounded: 'md'
              }
            }}
          />
          <Text textStyle="heading.xl">{guild.name}</Text>
        </MiddleWrap>

        <VStack align={align}>
          <Text textStyle="heading.sm" textAlign="center">
            Censor Bot is not in your server yet
          </Text>

          <Button
            variant="primary"
            w="150px"
            onClick={() => {
              inviteBot(true)
            }}
          >
            Invite
          </Button>
          <Text
            textStyle="label.sm"
            textDecor="underline"
            cursor="pointer"
            onClick={() => {
              inviteBot(false)
            }}
          >
            Only necessary permissions
          </Text>
        </VStack>
      </VStack>
    </VStack>
  )
}
