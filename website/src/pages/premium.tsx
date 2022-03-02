import { Button } from '@chakra-ui/button'
import { Text, VStack, Link } from '@chakra-ui/layout'
import { Wrap } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { BuyPremium } from '~/BuyPremium'

export default function Premium() {
  return (
    <VStack padding="10" align="center">
      <NextSeo
        title="Censor Bot Premium"
        description="Can't get enough? Get even more features, at an amazingly affordable price!"
        openGraph={{
          title: 'Censor Bot Premium',
          description:
            "Can't get enough? Get even more features, at an amazingly affordable price!"
        }}
      />
      <BuyPremium />
      <Wrap
        p={4}
        spacing={4}
        rounded="lg"
        align="center"
        bg="darker.20"
        w="600px"
        maxW="70vw"
        transition="background .12s ease"
      >
        <Text align="left" w="70%">
          We know times are tough. If you're a school or a teacher, teaching on
          Discord, we offer free premium for your teaching servers.
        </Text>
        <Button href="mailto:teachers@jpbbots.org" as={Link}>
          Contact Us
        </Button>
      </Wrap>
    </VStack>
  )
}
