import type { ReactNode } from 'react'

import { Box, HStack, Text, Center, BoxProps } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/button'
import { Icon } from '@chakra-ui/icon'
import { FaCrown } from 'react-icons/fa'

export interface CategoryOptionProps extends BoxProps {
  label: string
  icon: ReactNode
  isPremium?: boolean
  isSelected?: boolean
}

export const CategoryOption = ({
  label,
  icon,
  isSelected = false,
  isPremium = false,
  ...boxProps
}: CategoryOptionProps) => (
  <Box
    as={Button}
    p={2}
    w="full"
    flexGrow={1}
    rounded="sm"
    bg={isSelected ? 'lighter.10' : 'transparent'}
    color={isSelected ? 'lighter.100' : 'lighter.60'}
    _hover={{ bg: 'lighter.5' }}
    _active={{ bg: 'lighter.10' }}
    _focus={{ bg: 'lighter.10' }}
    {...boxProps}
  >
    <HStack justify="space-between" w="full" flexGrow={1}>
      <HStack spacing={4}>
        <Center color={isSelected ? 'lighter.100' : 'lighter.20'}>
          {icon}
        </Center>
        <Text color="currentColor">{label}</Text>
      </HStack>
      {isPremium && (
        <Center color="brand.100">
          <Icon as={FaCrown} />
        </Center>
      )}
    </HStack>
  </Box>
)
