import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { HStack, VStack } from '@chakra-ui/layout'
import { PremiumCard, PremiumPerk } from '@jpbbots/censorbot-components'
import { PremiumTypes } from 'typings'
import { chargebee } from './_app'

export default function Premium() {
  const [user, login] = useUser(false)
  const openCheckout = (id: PremiumTypes): void => {
    if (!chargebee) return
    if (!user || !user.email) {
      return void login(true)
    }

    chargebee.openCheckout({
      hostedPage: () => {
        return Api.ws
          .request('CREATE_HOSTED_PAGE', { plan: id })
          .catch((err) => {
            console.log('err', err)
          })
      }
    })
  }
  return (
    <VStack padding="10">
      <HStack align="stretch">
        <PremiumCard
          title="Premium"
          perks={[PremiumPerk.PremiumServers_3, PremiumPerk.PremiumSupport]}
          monthlyPrice={5}
          onBuy={() => openCheckout(PremiumTypes.Premium)}
        />
        <PremiumCard
          title="Super Premium"
          perks={[
            PremiumPerk.PremiumServers_6,
            PremiumPerk.PremiumSupport,
            PremiumPerk.BetaAccess
          ]}
          monthlyPrice={10}
          onBuy={() => openCheckout(PremiumTypes.SuperPremium)}
        />
        <PremiumCard
          title="Own Instance"
          perks={[
            PremiumPerk.IncludedHosting,
            PremiumPerk.CustomAvatarUsername,
            PremiumPerk.FeatureRequests
          ]}
          monthlyPrice={25}
          onBuy={() => openCheckout(PremiumTypes.OwnInstance)}
        />
      </HStack>
    </VStack>
  )
}
