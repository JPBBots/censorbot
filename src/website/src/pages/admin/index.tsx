import { AdminAction, AdminActionObject } from '@censorbot/typings'
import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { Spinner, VStack, Text, Button, Input, HStack } from '@chakra-ui/react'
import { MiddleWrap } from '@jpbbots/theme'
import Router from 'next/router'
import { useEffect } from 'react'
import { useInput, useSelect } from '@/hooks/useInput'

export default function Admin() {
  const { user } = useUser(true)

  const { Input: ClusterInput, value: clusterValue } = useInput<number>()
  const { Select: EC2Selector, value: selectedEC2 } = useSelect<
    'NA-1H' | 'NA-2H' | 'EU-1' | 'SA-1'
  >()

  useEffect(() => {
    if (!user) return

    if (!user.admin) void Router.push('/')
  }, [user])

  if (!user) return <Spinner />

  const action = <A extends AdminAction>(
    action: AdminActionObject & { type?: A }
  ) => {
    Api.ws.request('ADMIN_ACTION', action)
  }

  return (
    <MiddleWrap spacing="16px">
      <VStack borderRadius="md" p="32px" bg="darker.10" w="500px" h="300px">
        <Text textStyle="heading.xl">Restarts</Text>
        <MiddleWrap justify="center" spacing="5px">
          <Button
            onClick={() =>
              action({ type: AdminAction.Restart, process: 'API' })
            }
          >
            Restart API
          </Button>
          <Button
            onClick={() => {
              action({ type: AdminAction.Restart, process: 'NA-2H' })
            }}
          >
            Restart NA-2H EC2
          </Button>
          <HStack>
            <ClusterInput placeholder="Process name" size="sm" />
            <Button
              onClick={() => {
                action({
                  type: AdminAction.Restart,
                  process: `${clusterValue!}`
                })
              }}
            >
              Restart
            </Button>
          </HStack>
          <HStack w="half">
            <EC2Selector w="half" size="sm">
              <option value="NA-1H">NA-1H</option>
              <option value="NA-2H">NA-2H</option>
              <option value="EU-1">EU-1</option>
              <option value="SA-1">SA-1</option>
            </EC2Selector>
            <Button
              onClick={() => {
                action({
                  type: AdminAction.Restart,
                  process: `${selectedEC2!}`
                })
              }}
            >
              Restart
            </Button>
          </HStack>
        </MiddleWrap>
      </VStack>
      <VStack borderRadius="md" p="32px" bg="darker.10" w="500px" h="300px">
        <Text textStyle="heading.xl">Invalidate Caches</Text>
        <MiddleWrap spacing="5px">
          <Button
            onClick={() => {
              action({ type: AdminAction.InvalidateCache, cache: 'api' })
            }}
          >
            API
          </Button>
          <Button
            onClick={() => {
              action({ type: AdminAction.InvalidateCache, cache: 'db' })
            }}
          >
            Database
          </Button>
        </MiddleWrap>
      </VStack>
    </MiddleWrap>
  )
}
