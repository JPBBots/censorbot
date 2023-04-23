import { useEffect, useState } from 'react'
import Router from 'next/router'
import { Api } from '@/structures/Api'

import { Ticket } from '@censorbot/typings'

import { useUser } from '@/hooks/useUser'

import { TicketInteraction } from '~/Tickets'

import { MiddleWrap } from '@jpbbots/theme'

import { Spinner } from '@chakra-ui/spinner'

export default function Tickets() {
  const { user } = useUser(true)
  const [tickets, setTickets] = useState<Ticket[]>()

  useEffect(() => {
    if (!user) return

    if (!user.admin) void Router.push('/')

    void Api.ws.request('GET_TICKETS').then((tickets) => {
      setTickets(tickets)
    })
  }, [user])

  if (!tickets) return <Spinner />

  return (
    <MiddleWrap spacing="10px" p="20px">
      {tickets.map((ticket) => (
        <TicketInteraction
          key={ticket.id}
          onDone={() => {
            setTickets(tickets.filter((x) => x.id !== ticket.id))
          }}
          {...ticket}
        />
      ))}
    </MiddleWrap>
  )
}
