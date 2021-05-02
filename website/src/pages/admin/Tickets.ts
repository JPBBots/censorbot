import { Page, PageInterface } from "../../structures/Page";

import { E } from '../../structures/Elements'

export class Tickets extends Page implements PageInterface {
  name = 'tickets'
  url = /tickets/
  fetchElements = [
    'tickets'
  ]

  async loading() {
    await this.api.waitForUser()
  }

  async go() {
    const tickets = await this.api.getTickets()
    if (!tickets) return

    E.set(this.e('tickets'), tickets.map(ticket => ({
      elm: 'div',
      children: [
        {
          elm: 'h3',
          text: `${ticket.id}; ${ticket.word}`
        },
        {
          elm: 'p',
          text: ''
        },
        {
          elm: 'a',
          classes: ['button'],
          text: 'Test',
          events: {
            click: async (event) => {
              const test = await this.api.testTicket(ticket.id);
              (event.target as HTMLElement).parentElement.querySelector('p').innerText = test.censored ? test.places.join(', ') : 'Done!'
            }
          }
        },
        {
          elm: 'a',
          classes: ['button'],
          text: 'Accept',
          events: {
            click: async (event) => {
              const req = await this.api.acceptTicket(ticket.id)
              if (req.success) E.delete((event.target as HTMLElement).parentElement)
            }
          }
        },
        {
          elm: 'a',
          classes: ['button'],
          text: 'Deny',
          events: {
            click: async (event) => {
              const req = await this.api.denyTicket(ticket.id)
              if (req.success) E.delete((event.target as HTMLElement).parentElement)
            }
          }
        },
        {
          elm: 'br'
        },
        {
          elm: 'br'
        },
        {
          elm: 'a',
          classes: ['button'],
          text: 'Clear',
          events: {
            click: (event) => {
              E.delete((event.target as HTMLElement).parentElement)
            }
          }
        }
      ]
    })))
  }

  async remove() {
    return true
  }
}