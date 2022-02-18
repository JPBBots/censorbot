import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { Button } from '@chakra-ui/button'
import { Flex, Text, VStack } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/react'
import { PremiumCard } from '@jpbbots/censorbot-components'
import { useEffect, useState } from 'react'
import { PremiumTypes } from '@jpbbots/cb-typings'
import { chargebee } from 'pages/_app'

import NextLink from 'next/link'

export function BuyPremium() {
  const [user, login] = useUser(false)

  const [processing, setProcessing] = useState(false)

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
        setProcessing(true)
      }
    })
  }

  useEffect(() => {
    if (processing && !user?.premium?.customer) Api.ws.ws.emit('RELOAD_SELF')
  }, [processing])

  if (processing) {
    return (
      <VStack justify="center">
        {user && !user.premium?.customer && (
          <>
            <Text textStyle="heading.xl">Processing your payment...</Text>
            <Text textStyle="label.md">This may take a few minutes</Text>
            <br />
            <Spinner w="100px" h="100px" />
          </>
        )}
        {user?.premium?.customer && user.premium?.count && (
          <>
            <Text textStyle="heading.xl">Successfully subscribed!</Text>
            <Text textStyle="label.md">
              Enjoy your {user.premium.count} servers
            </Text>
            <NextLink href="/dashboard" passHref>
              <Button onClick={() => {}}>Go to dashboard</Button>
            </NextLink>
            <Text textStyle="label.sm">
              Manage your payment through the user dropdown
            </Text>
          </>
        )}
      </VStack>
    )
  }

  return (
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
}
