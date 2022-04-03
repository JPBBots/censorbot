import {
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  TextProps,
  VStack
} from '@chakra-ui/react'

import MonthlyIcon from 'images/premium/monthly.png'
import YearlyIcon from 'images/premium/yearly.png'
import TrialIcon from 'images/premium/trial.png'

import {
  brandGrad,
  leftGradient,
  PremiumCard,
  rightGradient,
  textGrad
} from '~/Premium'
import { Root } from '~/Root'
import { CSSObject } from '@emotion/react'
import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { PremiumTypes } from 'typings'
import { useState } from 'react'
import { chargebee } from './_app'
import NextLink from 'next/link'
import { MiddleWrap, wMT } from '@jpbbots/theme'
import { GradientPremiumIcon } from '~/PremiumIcon'
import { NextSeo } from 'next-seo'

const gradientButton: CSSObject = {
  _before: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(to right, ${rightGradient.hex()} 6.89%, ${leftGradient.hex()} 50%)`,
    borderRadius: 'sm',
    opacity: 0,
    transition: 'opacity 0.8s',
    zIndex: -1
  },
  _hover: {
    _before: {
      opacity: 1
    }
  }
}

const infoTextProps: TextProps = {
  fontWeight: 600,
  color: 'lighter.60',
  fontSize: { tablet: '20px', mobile: '15px' },
  lineHeight: '24px',
  textAlign: 'center'
}

export default function Premium({ hideFooter }: { hideFooter?: boolean }) {
  const { user, getEmail } = useUser(false)

  const [processing, setProcessing] = useState(false)

  const openCheckout = async (id: PremiumTypes) => {
    if (!chargebee) return

    const email = await getEmail().catch(() => {})
    if (!user || !email) return

    if (user.premium?.customer && user.premium.count)
      return void Api.createPortal()

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

  const cards = {
    monthly: (
      <PremiumCard
        iconSrc={MonthlyIcon.src}
        name="Monthly"
        price="$5"
        premiumServers={3}
      >
        <Button
          w="full"
          marginBlockStart="auto !important"
          onClick={() => void openCheckout(PremiumTypes.Premium)}
        >
          Purchase
        </Button>
      </PremiumCard>
    ),
    yearly: (
      <PremiumCard
        iconSrc={YearlyIcon.src}
        name="Yearly"
        price="$50"
        timeDenote="yearly"
        premiumServers={3}
        border={wMT(1025)}
      >
        <Text {...infoTextProps}>Beta Access</Text>

        <Button
          marginBlockStart="auto !important"
          zIndex={1}
          w="full"
          bg={`linear-gradient(to right, ${leftGradient.hex()} 6.89%, ${rightGradient.hex()})`}
          sx={gradientButton}
          onClick={() => void openCheckout(PremiumTypes.YearlyPremium)}
        >
          Purchase
        </Button>
      </PremiumCard>
    ),
    trial: (
      <PremiumCard
        iconSrc={TrialIcon.src}
        name="Trial"
        price="Free"
        timeDenote="for 24 hours"
        premiumServers="No Payment Required"
      >
        <Text {...infoTextProps}>
          Try out the full Premium Censor Bot experience without payment on a
          server of your choice.
        </Text>
        <Button w="full" marginBlockStart="auto !important">
          Try It Out
        </Button>
      </PremiumCard>
    )
  }

  if (processing) {
    return (
      <VStack justify="center">
        {user && !user.premium?.customer && !user.premium?.count && (
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
    <Root showFooter={!hideFooter}>
      <NextSeo
        title="Censor Bot Premium"
        description="Can't get enough? Get even more features, at an amazingly affordable price!"
        openGraph={{
          title: 'Censor Bot Premium',
          description:
            "Can't get enough? Get even more features, at an amazingly affordable price!"
        }}
      />
      <Box display={{ tablet: 'unset', mobile: 'none' }} pb="48px" pt="20px">
        <GradientPremiumIcon />
      </Box>
      <Text
        fontSize="64px"
        lineHeight="77px"
        fontWeight={700}
        bgGradient={brandGrad}
        bgClip="text"
        textAlign="center"
      >
        Censor Bot Premium
      </Text>
      <Flex
        gridGap="10px 32px"
        flexGrow={1}
        justify="center"
        flexWrap="wrap"
        pt={{ tablet: '48px' }}
      >
        {cards.monthly}
        {cards.yearly}
        {cards.trial}
      </Flex>
      <VStack pt="128px">
        <Text
          textStyle="heading.xl"
          bgGradient={textGrad}
          bgClip="text"
          textAlign="center"
          textTransform="uppercase"
        >
          Premium Comparison
        </Text>
      </VStack>
      <VStack pt="128px">
        <Text
          textStyle="heading.xl"
          fontSize="32px"
          bgGradient={textGrad}
          bgClip="text"
          textAlign="center"
          textTransform="uppercase"
        >
          Get The Most Out Of{' '}
          <Text
            as="span"
            fontSize="inherit"
            fontWeight="inherit"
            textTransform="inherit"
            bgGradient={brandGrad}
            bgClip="text"
          >
            Censor Bot
          </Text>
        </Text>
        <MiddleWrap
          spacing="5px"
          pt={{ desktop: '128px', mobile: '34px' }}
          gridColumnGap={{ desktop: '32px', mobile: '5px' }}
        >
          <PremiumCard name="Upgrade" premiumServers={6} price="$10">
            <Button
              w="full"
              marginBlockStart="auto !important"
              onClick={async () =>
                await openCheckout(PremiumTypes.SuperPremium)
              }
            >
              Purchase
            </Button>
          </PremiumCard>
          <PremiumCard
            name="Teachers"
            price="Free"
            timeDenote="forever"
            premiumServers="Times are tough"
          >
            <Text {...infoTextProps}>
              If you’re a school or a teacher, teaching on Discord, we offer
              free premium benefits for your teaching communities
            </Text>
            <NextLink href="mailto:teachers@jpbbots.org">
              <Button w="full" marginBlockStart="auto !important">
                Contact Us
              </Button>
            </NextLink>
          </PremiumCard>
          <PremiumCard
            name="Nitro Boost"
            timeDenote="Use the stuff you already own!"
            premiumServers={1}
          >
            <Text {...infoTextProps}>for boosting our server</Text>
            <Button w="full" marginBlockStart="auto !important">
              Boost
            </Button>
          </PremiumCard>

          <Flex w="full" justify="center">
            <PremiumCard name="Own Instance" price="$25">
              <VStack spacing={{ desktop: '35px', mobile: '20px' }}>
                <Text {...infoTextProps}>Hosting attached to your bot</Text>
                <Text {...infoTextProps}>Custom avatar/username</Text>
                <Text {...infoTextProps}>Extra feature requests</Text>
              </VStack>
              <Button
                w="full"
                marginBlockStart="auto !important"
                onClick={() => void openCheckout(PremiumTypes.OwnInstance)}
              >
                Purchase
              </Button>
            </PremiumCard>
          </Flex>
        </MiddleWrap>
      </VStack>
      <Text
        pt="25px"
        textStyle="label.md"
        cursor="pointer"
        onClick={() => window.open('https://www.figma.com/@liiiiiii', '_blank')}
      >
        Diamond icons by @liiiiiii
      </Text>
    </Root>
  )
}
