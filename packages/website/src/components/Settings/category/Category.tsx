import type { StackProps } from '@chakra-ui/react'
import { Box, Text, VStack } from '@chakra-ui/react'

export interface CategoryProps extends StackProps {
  title: string
}

export const Category = ({ title, children, ...stackProps }: CategoryProps) => (
  <VStack w="full" flexGrow={1} spacing={0} align="start" {...stackProps}>
    <Box p={2}>
      <Text textStyle="overline" color="lighter.80">
        {title}
      </Text>
    </Box>
    <VStack w="full" align="start" spacing={1}>
      {children}
    </VStack>
  </VStack>
)
