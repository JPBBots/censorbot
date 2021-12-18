import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { Button } from '@chakra-ui/button'
import { Text, VStack } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Tooltip } from '@chakra-ui/tooltip'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Payment() {
  const [user] = useUser(true)
  const router = useRouter()

  useEffect(() => {
    if (!user?.premium?.customer) Api.ws.ws.emit('RELOAD_SELF')
  }, [])

  return (
    <VStack justify="center">
      {user && !user.premium?.customer && (
        <>
          <Text textStyle="heading.xl">Processing your payment...</Text>
          <Text textStyle="label.md">This may take a few minutes</Text>
          <br />
          <Spinner w="100px" h="100px" />
        </>
      )}
      {user?.premium?.customer && user.premium?.count && (
        <>
          <Text textStyle="heading.xl">Successfully subscribed!</Text>
          <Text textStyle="label.md">
            Enjoy your {user.premium.count} servers
          </Text>
          <Button onClick={() => void router.push('/dashboard')}>
            Go to dashboard
          </Button>
          <Tooltip>Manage your payment through the user dropdown</Tooltip>
        </>
      )}
    </VStack>
  )
}
