import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/layout'

const boxWidth = {
  tablet: '200px',
  mobile: '90px'
}

export default function Test() {
  return (
    <Box w="full" h="full" p="16px">
      <VStack w="half" color="lighter.60" spacing="0px">
        <HStack alignSelf="flex-end" spacing="0px" pr="1px">
          <Flex
            textAlign="center"
            justify="center"
            align="center"
            borderLeft="2px solid"
            borderLeftColor="lighter.5"
            borderTop="2px solid"
            borderTopColor="lighter.5"
            borderTopLeftRadius="3px"
            w={boxWidth}
            h={{ tablet: '86px', mobile: '40px' }}
            bg="lighter.5"
          >
            <Text
              fontWeight={500}
              lineHeight="22px"
              textTransform="uppercase"
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
          {Array(20)
            .fill(null)
            .map((x, i) => (
              <HStack
                border="1px solid"
                borderColor="lighter.5"
                justify="space-between"
                key={i}
                position="relative"
                py={{ tablet: '16px', mobile: '7px' }}
                w="full"
              >
                <Text pl={{ desktop: '64px', mobile: '30px' }}>
                  Server Filters
                </Text>
                <HStack spacing="0px" position="absolute" right="0px">
                  <Box
                    borderLeft="2px solid"
                    borderLeftColor="lighter.10"
                    textAlign="center"
                    py={{ tablet: '18px', mobile: '9px' }}
                    w={boxWidth}
                  >
                    150
                  </Box>
                  <Box
                    py={{ tablet: '19px', mobile: '11px' }}
                    borderLeft="3px solid"
                    borderLeftColor="brand.100"
                    borderRight="3px solid"
                    borderRightColor="brand.100"
                    textAlign="center"
                    w={boxWidth}
                  >
                    1500
                  </Box>
                </HStack>
              </HStack>
            ))}
        </VStack>
      </VStack>
    </Box>
  )
}
