import { useState } from 'react'

import { Api } from '@/structures/Api'

import { Ticket } from '@censorbot/typings'

import { VStack, Text, HStack } from '@chakra-ui/layout'
import { Input } from '@chakra-ui/input'
import { Button } from '@chakra-ui/button'

export interface TicketInteractionOptions extends Ticket {
  onDone: () => void
}

export function TicketInteraction({
  onDone,
  ...ticket
}: TicketInteractionOptions) {
  const [censored, setCensored] = useState<boolean>(true)
  const [initialPlaces, setInitialPlaces] = useState<string[]>()
  const [places, setPlaces] = useState<string[]>()

  const [bypasses, setBypasses] = useState<Record<string, string>>({})

  const testTicket = async () => {
    const test = await Api.ws.request('TEST_TICKET', {
      id: ticket.id,
      bypasses
    })
    setCensored(test.censored)

    setPlaces(test.places)
    if (!places) setInitialPlaces(test.places)
  }

  return (
    <VStack
      p="10px"
      key={ticket.id}
      bg="darker.20"
      borderRadius="md"
      minW="300px"
      minH="300px"
    >
      <Text>
        ({ticket.id}) {ticket.word}
      </Text>
      <Button onClick={async () => await testTicket()} size="sm">
        Test
      </Button>
      <VStack>
        {initialPlaces?.map((x) => (
          <HStack justify="space-between" w="full">
            <Text color={places?.includes(x) ? 'red' : 'green'}>{x}</Text>
            <Input
              onChange={({ target }) => {
                setBypasses({
                  ...bypasses,
                  [x]: target.value
                })
              }}
              onKeyDown={(_ev) => {
                void testTicket()
              }}
              onBlur={() => void testTicket()}
              size="sm"
              w="100px"
            />
          </HStack>
        ))}
      </VStack>
      <HStack h="full" align="flex-end">
        {!censored && (
          <Button
            variant="primary"
            onClick={async () => {
              const accept = await Api.ws.request('ACCEPT_TICKET', {
                id: ticket.id,
                bypasses
              })
              if (accept.success) {
                onDone()
              }
            }}
          >
            Accept
          </Button>
        )}
        <Button
          onContextMenu={(ev) => {
            ev.preventDefault()
          }}
          onClick={async () => {
            const deny = await Api.ws.request('DENY_TICKET', { id: ticket.id })
            if (deny.success) {
              onDone()
            }
          }}
        >
          Deny
        </Button>
      </HStack>
    </VStack>
  )
}
