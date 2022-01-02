import { Tooltip as ChakraTooltip } from '@chakra-ui/tooltip'

import { Flex } from '@chakra-ui/react'

export interface TooltipProps {
  children: string
}

export const Tooltip = ({ children }: TooltipProps) => {
  return (
    <ChakraTooltip
      hasArrow
      bg="darker.100"
      p={2}
      borderRadius="md"
      label={`${children}`}
    >
      <Flex
        borderRadius="full"
        bg="lighter.20"
        p={2}
        w="25px"
        h="25px"
        alignItems="center"
        justifyItems="center"
        userSelect="none"
      >
        ?
      </Flex>
    </ChakraTooltip>
  )
}
