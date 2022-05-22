import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/layout'
import { Icon } from '@chakra-ui/react'

import { FaCheck, FaTimes } from 'react-icons/fa'
import { brandGrad } from '.'

const normalLineColor = '#4b525e'

const boxWidth = {
  tablet: '200px',
  mobile: '90px'
}

const premiumFeatures = [
  {
    feature: 'Server Filters',
    normal: '150',
    premium: '1500'
  },
  {
    feature: 'Uncensor Filters',
    normal: '150',
    premium: '1500'
  },
  {
    feature: 'Image Censoring',
    normal: false,
    premium: true
  },
  {
    feature: 'Resend',
    normal: false,
    premium: true
  },
  {
    feature: 'Ignored Roles & Channels',
    normal: '5',
    premium: 'INFINITE'
  },
  {
    feature: 'Advanced Exceptions',
    normal: '5',
    premium: '100'
  },
  {
    feature: 'Maximum Punishments',
    normal: '5',
    premium: '20'
  },
  {
    feature: 'Response Characters',
    normal: '200',
    premium: '1000'
  },
  {
    feature: 'Response Delete Time',
    normal: '120s',
    premium: '600s'
  },
  {
    feature: 'DM Response Message',
    normal: false,
    premium: true
  },
  {
    feature: 'Toxcity Filter',
    normal: false,
    premium: true
  }
]

function CheckOrEx({ bool }: { bool: boolean }) {
  if (bool) {
    return <Icon fontSize="22px" color="brand.100" as={FaCheck} />
  } else {
    return <Icon fontSize="22px" color="" as={FaTimes} />
  }
}

export function FeatureTable() {
  return (
    <VStack w="full" color="lighter.60" spacing="0px">
      <HStack alignSelf="flex-end" spacing="0px">
        <Flex
          textAlign="center"
          justify="center"
          align="center"
          borderLeft="2px solid"
          borderLeftColor={normalLineColor}
          borderTop="2px solid"
          borderTopColor={normalLineColor}
          borderTopRadius="3px"
          w={boxWidth}
          h={{ tablet: '86px', mobile: '40px' }}
          bg="lighter.5"
        >
          <Text
            fontWeight={500}
            lineHeight="22px"
            textTransform="uppercase"
            color="inherit"
            fontSize={{ tablet: '18px', mobile: '10px' }}
          >
            Normal
          </Text>
        </Flex>
        <Flex
          textAlign="center"
          justify="center"
          align="center"
          w={boxWidth}
          border="3px solid"
          borderColor="brand.100"
          borderRadius="3px"
          borderBottom="unset"
          borderBottomRadius="unset"
          bg="brand.10"
          h={{ tablet: '86px', mobile: '40px' }}
        >
          <Text
            fontWeight={700}
            lineHeight="22px"
            textTransform="uppercase"
            fontSize={{ tablet: '18px', mobile: '10px' }}
            color="brand.100"
          >
            Premium
          </Text>
        </Flex>
      </HStack>
      <VStack w="full" spacing="0px">
        {premiumFeatures.map((x, i) => (
          <HStack
            border="1px solid"
            borderColor="lighter.5"
            borderRight="unset"
            justify="space-between"
            key={x.feature}
            position="relative"
            py={{ tablet: '16px', mobile: '7px' }}
            fontSize={{ tablet: '18px', mobile: '12px' }}
            w="full"
          >
            <Text
              pl={{ desktop: '64px', mobile: '20px' }}
              color="inherit"
              fontSize="inherit"
            >
              {x.feature}
            </Text>
            <HStack spacing="0px" position="absolute" right="0px">
              <Flex
                borderLeft="2px solid"
                justifyContent="center"
                alignContent="center"
                borderLeftColor={normalLineColor}
                textAlign="center"
                py={{ tablet: '20px', mobile: '10px' }}
                borderBottom={
                  premiumFeatures.length - 1 === i
                    ? '2px solid ' + normalLineColor
                    : 'unset'
                }
                borderBottomRadius={
                  premiumFeatures.length - 1 === i ? '3px' : undefined
                }
                w={boxWidth}
              >
                {typeof x.normal === 'boolean' ? (
                  <CheckOrEx bool={x.normal} />
                ) : (
                  String(x.normal)
                )}
              </Flex>
              <Flex
                py={{ tablet: '20px', mobile: '11px' }}
                justifyContent="center"
                alignContent="center"
                border="3px solid"
                borderColor="brand.100"
                borderTop="unset"
                borderBottom={
                  premiumFeatures.length - 1 === i ? undefined : 'unset'
                }
                borderBottomRadius={
                  premiumFeatures.length - 1 === i ? '3px' : undefined
                }
                textAlign="center"
                fontWeight={700}
                w={boxWidth}
                color="brand.100"
              >
                {typeof x.premium === 'boolean' ? (
                  <CheckOrEx bool={x.premium} />
                ) : (
                  String(x.premium)
                )}
              </Flex>
            </HStack>
          </HStack>
        ))}
      </VStack>
    </VStack>
  )
}
