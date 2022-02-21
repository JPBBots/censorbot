import { useUser } from '@/hooks/useAuth'
import { Api } from '@/structures/Api'
import { Ticket } from '@jpbbots/cb-typings'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { MiddleWrap } from '~/MiddleWrap'
import { Loading } from '~/styling/Loading'
import { TicketInteraction } from '~/Tickets'

export default function Tickets() {
  const [user] = useUser(true)
  const [tickets, setTickets] = useState<Ticket[]>()

  useEffect(() => {
    if (!user) return

    if (!user.admin) void Router.push('/')

    void Api.ws.request('GET_TICKETS').then((tickets) => {
      setTickets(tickets)
    })
  }, [user])

  if (!tickets) return <Loading />

  return (
    <MiddleWrap spacing="10px" p="20px">
      {tickets.map((ticket) => (
        <TicketInteraction
          onDone={() => {
            setTickets(tickets.filter((x) => x.id !== ticket.id))
          }}
          {...ticket}
        />
      ))}
    </MiddleWrap>
  )
}
