import BRANDING from '@/BRANDING'
import { Utils } from '@/utils/Utils'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { Image } from '@chakra-ui/react'
import { CensorBotEmbed, DiscordChat } from '~/DiscordChat'

import BlurryImage from 'images/blurry.jpg'

export default function Test() {
  return (
    <DiscordChat
      h="300px"
      orchestra={async (ctx) => {
        await ctx.setTyping({
          content: 'Fuck you!',
          waitAfter: 400
        })

        ctx.setChats([
          {
            content: <CensorBotEmbed />,
            avatarUrl: BRANDING.logo,
            username: 'Censor Bot'
          },
          {
            content: '#### you!',
            badge: 'Resent'
          }
        ])

        await Utils.wait(2e3)
        ctx.clearChats()

        await Utils.wait(500)
        await ctx.setTyping({
          content: <Image w="120px" h="120px" src={BlurryImage.src} />,
          waitSend: 700,
          waitAfter: 400
        })

        ctx.setChats([
          {
            content: <CensorBotEmbed />,
            avatarUrl: BRANDING.logo,
            username: 'Censor Bot'
          }
        ])

        await Utils.wait(2e3)
        ctx.clearChats()

        await Utils.wait(500)

        await ctx.setTyping({ content: 'fu', waitAfter: 200 })
        await ctx.setTyping({ content: 'ck', waitAfter: 400 })

        ctx.setChats([
          {
            content: <CensorBotEmbed />,
            avatarUrl: BRANDING.logo,
            username: 'Censor Bot'
          }
        ])

        await Utils.wait(2e3)
        ctx.clearChats()

        await Utils.wait(500)
        ctx.loop()
      }}
    />
  )
}
