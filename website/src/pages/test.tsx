import { Button, HStack, Text } from '@chakra-ui/react'

import PremiumIcon from 'images/premium/premium.png'
import SuperPremiumIcon from 'images/premium/superpremium.png'
import OwnInstanceIcon from 'images/premium/owninstance.png'

import { PremiumCard } from '~/Premium'
import { Root } from '~/Root'
import { CSSObject } from '@emotion/react'

const gradientButton: CSSObject = {
  _before: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to right, #31b5ff 6.89%, #6c7bff 50%)',
    borderRadius: 'sm',
    opacity: 0,
    transition: 'opacity 0.4s',
    zIndex: -1
  },
  _hover: {
    _before: {
      opacity: 1
    }
  }
}

export default function Test() {
  return (
    <Root>
      <HStack pt="100px">
        <PremiumCard
          iconSrc={PremiumIcon.src}
          name="Premium"
          price="$5"
          premiumServers={3}
        >
          <Text fontSize="inherit">Premium Support</Text>
          <Text fontSize="inherit">Beta Access</Text>

          <Button mt="50px !important" w="full" justifySelf="flex-end">
            Purchase
          </Button>
        </PremiumCard>
        <PremiumCard
          iconSrc={SuperPremiumIcon.src}
          name="Super Premium"
          price="$10"
          premiumServers={6}
          border
        >
          <Text fontSize="inherit">Premium Support</Text>
          <Text fontSize="inherit">Beta Access</Text>

          <Button
            justifySelf="flex-end"
            mt="50px !important"
            zIndex={1}
            w="full"
            bg="linear-gradient(to right, #6c7bff 6.89%, #31b5ff)"
            sx={gradientButton}
          >
            Purchase
          </Button>
        </PremiumCard>
        <PremiumCard
          iconSrc={OwnInstanceIcon.src}
          name="Own Instance"
          price="$25"
        ></PremiumCard>
      </HStack>
    </Root>
  )
}
