import { HStack } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'

interface InlineOptionGroupProps extends PropsWithChildren<unknown> {}

export const InlineOptionGroup = ({ children }: InlineOptionGroupProps) => (
  <HStack
    spacing={2}
    p={2}
    pl={4}
    bg="lighter.5"
    rounded="md"
    children={children}
  />
)
