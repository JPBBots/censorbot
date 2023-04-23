import { useRef, useEffect } from 'react'

import { Utils } from '@/utils/Utils'

import { ShortGuild } from '@censorbot/typings'

import { useGuild } from '@/hooks/useGuild'
import { useMeta } from '@/hooks/useMeta'
import { useGuilds } from '@/hooks/useUser'

import { store } from '@/store'
import { setGuilds } from '@/store/reducers/user.reducer'

import { PageButton } from '~/link'

import { VStack, Box, Text, HStack } from '@chakra-ui/layout'
import { Icon } from '@chakra-ui/icon'
import { Button } from '@chakra-ui/button'
import { Avatar } from '@chakra-ui/avatar'
import { animate } from 'framer-motion'
import { FaAngleLeft } from 'react-icons/fa'

export function NeedsInvite({ guild }: { guild: ShortGuild }) {
  const { serverCount } = useMeta()
  const { id, updateGuild } = useGuild()
  const [guilds] = useGuilds()

  const countRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (countRef) {
      const controls = animate(60000, serverCount, {
        duration: 1,
        onUpdate(value: number) {
          if (countRef.current)
            countRef.current.innerText = Number(
              value.toFixed(0)
            ).toLocaleString()
        }
      })

      return () => controls.stop()
    }
  }, [serverCount, countRef])

  const inviteBot = (admin: boolean) => {
    const window = Utils.openWindow(
      `/invite?id=${id}&admin=${admin}`,
      'Invite the bot'
    )

    void window.wait().then(() => {
      void updateGuild().then((hasGuild) => {
        console.log({ hasGuild })
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

  return (
    <VStack p="16px">
      <Box alignSelf="flex-start">
        <PageButton href="/dashboard">
          <Icon as={FaAngleLeft} fontSize="25px" mr="5px" />
          Go Back
        </PageButton>
      </Box>
      <VStack>
        <Text textAlign="center" textStyle="heading.xl" color="brand.100">
          Censor Bot is waiting...
        </Text>
        <HStack bg="lighter.5" p="16px" spacing="16px" borderRadius="full">
          <Avatar
            name={guild.name}
            w="60px"
            h="60px"
            bg="darker.5"
            fontSize="20px"
            src={
              guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : undefined
            }
          />
          <Text textStyle="heading.sm">{guild.name}</Text>
        </HStack>
        <VStack spacing="20px">
          <Text textAlign="center" textStyle="heading.sm">
            You haven't invited Censor Bot to your server yet!
          </Text>
          <VStack spacing="3px">
            <Button variant="brand" w="200px" onClick={() => inviteBot(true)}>
              Invite Censor Bot
            </Button>
            <Text
              fontSize="13px"
              cursor="pointer"
              textDecor="underline"
              onClick={() => inviteBot(false)}
            >
              Only necessary permissions
            </Text>
          </VStack>
          <VStack>
            <Text textStyle="label.md" fontSize="inherit">
              Serving{' '}
              <Text
                textStyle="label.md"
                color="brand.100"
                fontSize="inherit"
                as="span"
                ref={countRef}
              >
                60,000
              </Text>{' '}
              communities on Discord
            </Text>
            <Text
              textStyle="label.md"
              textAlign="center"
              color="lighter.40"
              fontSize="inherit"
              p={{ tablet: '0px', mobile: '16px' }}
            >
              The largest and most customizable anti-swear and filtering bot
            </Text>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}
