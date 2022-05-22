import { Button } from '@chakra-ui/button'
import { Text, VStack } from '@chakra-ui/layout'
import NextLink from 'next/link'

export default function Custom404() {
  return (
    <VStack>
      <Text textStyle="heading.xl">Page not found.</Text>

      <NextLink href="/" passHref>
        <Button>Go Home</Button>
      </NextLink>
    </VStack>
  )
}
