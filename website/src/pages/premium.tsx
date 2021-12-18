import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { Button } from '@chakra-ui/button'
import { Flex, Text, VStack } from '@chakra-ui/layout'
import { PremiumCard } from '@jpbbots/censorbot-components'
import { useRouter } from 'next/router'
import { PremiumTypes } from 'typings'
import { chargebee } from './_app'

export default function Premium() {
  const [user, login] = useUser(false)
  const router = useRouter()

  const openCheckout = (id: PremiumTypes): void => {
    if (!chargebee) return
    if (!user || !user.email) {
      return void login(true)
    }

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
    <VStack padding="10">
      {!user || !user.premium?.customer ? (
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
      ) : (
        <VStack>
          <Text>You're already a customer</Text>
          <Button
            onClick={() => {
              void Api.createPortal()
            }}
          >
            Manage
          </Button>
        </VStack>
      )}
    </VStack>
  )
}
