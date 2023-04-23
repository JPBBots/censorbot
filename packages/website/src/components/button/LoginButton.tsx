import { useUser } from '@/hooks/useUser'

import { Button } from '@chakra-ui/button'

export function LoginButton({ name = 'Login' }: { name?: string }) {
  const { login } = useUser(false)

  return (
    <Button
      onClick={() => {
        void login()
      }}
    >
      {name}
    </Button>
  )
}
