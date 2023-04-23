import { PropsWithChildren, useEffect, useRef, useState } from 'react'

import { useWindowSize } from 'react-use'

import { Footer } from '~/Footer'
import { HEADER_HEIGHT } from '~/Navbar/Header'

import { VStack, Flex, StackProps } from '@chakra-ui/layout'

export interface RootProps extends PropsWithChildren<StackProps> {
  showFooter?: boolean
}

function isOverflown(element: Element) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  )
}

export function Root({
  children,
  showFooter = true,
  ...stackProps
}: RootProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const { height } = useWindowSize()
  const [overflowing, setOverflowing] = useState<boolean>(false)
  const [overflowingHeight, setOverflowingHeight] = useState<number>(0)

  useEffect(() => {
    if (mainRef.current && height > overflowingHeight) {
      const isOverflowing = isOverflown(mainRef.current)
      if (isOverflowing) {
        setOverflowingHeight(height)
      }
      setOverflowing(isOverflowing)
    }
  }, [children, mainRef.current, height])

  return (
    <VStack
      minH={`calc(100vh${
        overflowing
          ? ''
          : ` - ${Number(HEADER_HEIGHT.replace('px', '')) + 1}px)`
      }`}
      ref={mainRef}
      {...stackProps}
    >
      {children}
      {showFooter && (
        <Flex alignItems="flex-end" h="full" w="full">
          <Footer />
        </Flex>
      )}
    </VStack>
  )
}
