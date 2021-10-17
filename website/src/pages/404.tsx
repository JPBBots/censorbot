import { Button } from '@chakra-ui/button'
import { Text, VStack } from '@chakra-ui/layout'
import { useRouter } from 'next/router'

export default function Custom404 () {
  const router = useRouter()

  return (
    <VStack>
      <Text textStyle="heading.xl">Page not found.</Text>

      <Button onClick={(() => {
        void router.push('/')
      })}>Go Home</Button>
    </VStack>
  )
}
