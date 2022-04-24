import BRANDING from '@/BRANDING'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { Image } from '@chakra-ui/react'
import { CensorBotEmbed, DiscordChat } from '~/DiscordChat'

export default function Test() {
  return (
    <DiscordChat
      orchestra={(ctx) => {
        ctx.setTyping({
          content: 'a',
          waitSend: 700,
          waitAfter: 400,
          onDone: () => {
            ctx.setChats([
              {
                content: <CensorBotEmbed />,
                avatarUrl: BRANDING.logo,
                username: 'Censor Bot'
              }
            ])
            setTimeout(() => {
              ctx.setChats([])
              setTimeout(() => ctx.loop(), 400)
            }, 2e3)
          }
        })
      }}
    />
  )
}
