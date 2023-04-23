import type { PropsWithChildren } from 'react'

import { HStack } from '@chakra-ui/layout'

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
