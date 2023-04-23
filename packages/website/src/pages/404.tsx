import { Text, VStack } from '@chakra-ui/layout'
import { PageButton } from '~/link'

export default function Custom404() {
  return (
    <VStack>
      <Text textStyle="heading.xl">Page not found.</Text>

      <PageButton href="/">Go Home</PageButton>
    </VStack>
  )
}
