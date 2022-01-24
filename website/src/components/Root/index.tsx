import { VStack, Flex, StackProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

import { Footer } from '~/Footer'
import { HEADER_HEIGHT } from '~/Navbar/Header'

export function Root({
  children,
  ...stackProps
}: PropsWithChildren<StackProps>) {
  return (
    <VStack
      minH={`calc(100vh - ${Number(HEADER_HEIGHT.replace('px', '')) + 1}px)`}
      {...stackProps}
    >
      {children}
      <Flex alignItems="flex-end" h="full" w="full">
        <Footer />
      </Flex>
    </VStack>
  )
}
