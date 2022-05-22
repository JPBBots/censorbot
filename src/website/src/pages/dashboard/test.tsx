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
          content: 'https://discord.gg/CRAbk4w',
          waitAfter: 400,
          messageStyle: {
            color: '#0645ad',
            fontSize: '14px',
            textDecorationColor: 'rgb(6, 69, 173)',
            textDecor: 'underline'
          }
        })

        await ctx.censorBotDelete()

        await ctx.setTyping({
          content: 'https://phishing.discord.com !!! free nitro!',
          waitAfter: 400
        })

        await ctx.censorBotDelete()

        ctx.loop()
      }}
    />
  )
}
