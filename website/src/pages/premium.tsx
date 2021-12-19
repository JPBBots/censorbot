import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { Button } from '@chakra-ui/button'
import { Flex, Text, VStack, Link } from '@chakra-ui/layout'
import { Icon, Wrap } from '@chakra-ui/react'
import { PremiumCard } from '@jpbbots/censorbot-components'
import { useRouter } from 'next/router'
import React from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { PremiumTypes } from 'typings'
import { chargebee } from './_app'

const Checkmark = () => {
  return <Icon as={FaCheck} color="green" />
}
const Exmark = () => {
  return <Icon as={FaTimes} color="red" />
}

export default function Premium() {
  const [user, login] = useUser(false)
  const router = useRouter()

  const openCheckout = (id: PremiumTypes): void => {
    if (!chargebee) return
    if (!user || !user.email) {
      return void login(true)
    }

    if (user.premium?.customer) return void Api.createPortal()

    chargebee.openCheckout({
      hostedPage: async () => {
        return await Api.ws
          .request('CREATE_HOSTED_PAGE', { plan: id })
          .catch((err) => {
            console.log('err', err)

            return {}
          })
      },
      success: () => {
        void router.push('/payment')
      }
    })
  }

  return (
    <VStack padding="10" align="center">
      <Flex gridGap={4} flexGrow={1} justify="center" flexWrap="wrap">
        <PremiumCard
          title="Premium"
          perks={['3 Premium Servers', 'Premium Support']}
          monthlyPrice={5}
          onBuy={() => openCheckout(PremiumTypes.Premium)}
        />
        <PremiumCard
          title="Super Premium"
          perks={['6 Premium Servers', 'Premium Support', 'Beta Access']}
          monthlyPrice={10}
          onBuy={() => openCheckout(PremiumTypes.SuperPremium)}
        />
        <PremiumCard
          title="Own Instance"
          perks={[
            'Hosting attached to any bot you own.',
            'Custom avatar/username',
            'Extra feature requests allowed!'
          ]}
          monthlyPrice={25}
          onBuy={() => openCheckout(PremiumTypes.OwnInstance)}
        />
      </Flex>
      )
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
