import { VStack, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { MotionImage, MotionVStack } from '~/motion'

import { boxGrad, textGrad } from '.'

export interface PremiumCardOptions {
  iconSrc?: string
  name: string
  price?: string
  premiumServers?: number | string
  border?: boolean
  children: ReactNode
  timeDenote?: string
}

export function PremiumCard({
  iconSrc,
  name,
  price,
  premiumServers,
  border,
  children,
  timeDenote = 'monthly'
}: PremiumCardOptions) {
  return (
    <MotionVStack
      alignSelf={border ? 'flex-start' : undefined}
      bgGradient={border ? textGrad : 'none'}
      pt={
        !!border || !iconSrc ? undefined : { desktop: '100px', mobile: '20px' }
      }
      p="4px"
      borderRadius="md"
      w="fit-content"
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
      <VStack bg="bg" p={border ? '30px 15px' : undefined} borderRadius="md">
        {iconSrc && (
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
        )}
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
        {(!!price || !!timeDenote) && (
          <Text fontSize="26px" color="lighter.40">
            {price && (
              <Text
                as="span"
                bgGradient={textGrad}
                bgClip="text"
                fontSize="inherit"
                textTransform="uppercase"
              >
                {price}
              </Text>
            )}{' '}
            {timeDenote}
          </Text>
        )}
        <VStack
          bgGradient={boxGrad}
          w={{ desktop: '405px', mobile: '300px' }}
          h={{ desktop: '291px', mobile: '250px' }}
          borderRadius="sm"
          p="32px"
          fontSize={{ desktop: '26px', mobile: '17px' }}
        >
          {premiumServers && (
            <VStack spacing="0px">
              {typeof premiumServers === 'number' && (
                <Text
                  textStyle="heading.xl"
                  bgGradient={textGrad}
                  bgClip="text"
                  fontSize="64px"
                  lineHeight="77px"
                >
                  {premiumServers}
                </Text>
              )}
              <Text
                bgGradient={textGrad}
                bgClip="text"
                fontSize="inherit"
                fontWeight="600"
              >
                {typeof premiumServers === 'number'
                  ? `Premium Server${premiumServers > 1 ? 's' : ''}`
                  : premiumServers}
              </Text>
            </VStack>
          )}
          <VStack w="full" h="full">
            {children}
          </VStack>
        </VStack>
      </VStack>
    </MotionVStack>
  )
}
