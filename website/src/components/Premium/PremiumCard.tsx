import { VStack, Text, Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { MotionImage, MotionVStack } from '~/motion'

import { boxGrad, textGrad } from '.'

export interface PremiumCardOptions {
  iconSrc: string
  name: string
  price: string
  premiumServers?: number
  border?: boolean
  children: ReactNode
  lastElm?: ReactNode
}

export function PremiumCard({
  iconSrc,
  name,
  price,
  premiumServers,
  border,
  children,
  lastElm
}: PremiumCardOptions) {
  return (
    <MotionVStack
      alignSelf={border ? 'flex-start' : undefined}
      bgGradient={border ? textGrad : 'none'}
      pt={border ? undefined : { desktop: '100px', mobile: '50px' }}
      p="4px"
      borderRadius="md"
      variants={{
        rest: {
          y: 0
        },
        animate: {
          y: -8,
          transition: {
            delayChildren: 0.05
          }
        }
      }}
      initial="rest"
      whileHover="animate"
      animate="rest"
    >
      <VStack bg="bg" p="30px 15px" borderRadius="md">
        <MotionImage
          src={iconSrc}
          w={{ desktop: 'initial', mobile: '200px' }}
          variants={{
            rest: {
              y: 0
            },
            animate: {
              y: -16
            }
          }}
        />
        <Text
          bgClip="text"
          bgGradient={textGrad}
          letterSpacing="0.1em"
          textTransform="uppercase"
          fontWeight={600}
          fontSize={{ desktop: '26px', mobile: '20px' }}
          lineHeight="22px"
        >
          {name}
        </Text>
        <Text>
          <Text as="span" bgGradient={textGrad} bgClip="text">
            {price}
          </Text>{' '}
          monthly
        </Text>
        <VStack
          bgGradient={boxGrad}
          w={{ desktop: '405px', mobile: '300px' }}
          h={{ desktop: '363px', mobile: '300px' }}
          borderRadius="sm"
          p="32px"
          fontSize="26px"
        >
          {premiumServers && (
            <VStack spacing="0px">
              <Text
                textStyle="heading.xl"
                bgGradient={textGrad}
                bgClip="text"
                fontSize="64px"
                lineHeight="77px"
              >
                {premiumServers}
              </Text>
              <Text bgGradient={textGrad} bgClip="text" fontSize="inherit">
                Premium servers
              </Text>
            </VStack>
          )}

          {children}

          {lastElm && (
            <Box justifySelf="flex-end" w="full">
              {lastElm}
            </Box>
          )}
        </VStack>
      </VStack>
    </MotionVStack>
  )
}
