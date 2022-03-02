import { Injectable } from '@nestjs/common'
import { Filter, FilterDatabaseEntryType } from '../../structures/Filter'
import { DatabaseService } from './database.service'

import {
  FilterSettings,
  ShortID,
  Ticket,
  TicketTest
} from '@jpbbots/cb-typings'
import { ThreadService } from './thread.service'
import { DiscordService } from './discord.service'
import { Embed } from '@jadl/embed'
import { JPBExp } from '../../structures/JPBExp'

@Injectable()
export class TicketsService {
  private cachedTickets: Ticket[] | null
  constructor(
    private readonly db: DatabaseService,
    private readonly thread: ThreadService,
    private readonly discord: DiscordService
  ) {}

  fakeDatabase: FilterSettings = {
    base: ['en', 'es', 'off', 'de', 'ru'],
    server: [],
    phrases: [],
    uncensor: [],
    words: []
  }

  async createNewFilter(): Promise<Filter> {
    const entries = await this.db.collection('filter_data').find({}).toArray()

    const simulatedFilter = new Filter()
    simulatedFilter.import(entries)

    return simulatedFilter
  }

  addBypasses(filter: Filter, bypasses: Record<string, string>) {
    Object.values(filter.filters)
      .flat()
      .forEach((exp) => {
        if (bypasses[exp._text]) {
          exp.addUncensor(bypasses[exp._text])
        }
      })
  }

  async getTickets() {
    if (this.cachedTickets) return this.cachedTickets

    const tickets = await this.db
      .collection('tickets')
      .find({ accepted: true })
      .toArray()

    setTimeout(() => {
      this.cachedTickets = null
    }, 120e3)
    this.cachedTickets = tickets

    return tickets
  }

  async testTicket(
    ticketId: ShortID,
    bypasses?: Record<string, string>
  ): Promise<TicketTest> {
    const tickets = await this.getTickets()

    const ticket = tickets.find((x) => x.id === ticketId)
    if (!ticket)
      return {
        censored: false,
        places: []
      }

    return await this.test(ticket.word, bypasses)
  }

  async test(
    word: string,
    bypasses?: Record<string, string>
  ): Promise<TicketTest> {
    const filter = await this.createNewFilter()
    if (bypasses) this.addBypasses(filter, bypasses)

    const result = filter.test(word, this.fakeDatabase)

    return {
      censored: !!result,
      places: result?.places?.map((x) => (x as unknown as JPBExp)._text) ?? []
    }
  }

  async exportFilterToDatabase(filter: Filter) {
    const data = filter.export()

    for (const entry of data) {
      if (entry.type === FilterDatabaseEntryType.BaseFilter) {
        await this.db.collection('filter_data').updateOne(
          {
            type: FilterDatabaseEntryType.BaseFilter,
            filter: entry.filter
          },
          {
            $set: {
              filterData: entry.filterData
            }
          }
        )
      }
    }

    this.thread.tell('UPDATE_FILTER', null)
  }

  async accept(ticketId: ShortID) {
    const ticket = await this.db.collection('tickets').findOne({ id: ticketId })
    if (!ticket) return

    this.cachedTickets = null

    await this.discord
      .dm(
        ticket.user,
        new Embed()
          .title('Ticket Fixed')
          .description(
            'Your phrase will no longer be censored\n\n' +
              'Reminder: you can always add words to your uncensor list to stop it in your server specifically'
          )
          .footer(`Ticket: ${ticket.id}`)
      )
      .catch(() => {})

    await this.db.collection('tickets').deleteOne({ id: ticket.id })
  }

  async deny(ticketId: ShortID) {
    const ticket = await this.db.collection('tickets').findOne({ id: ticketId })
    if (!ticket) return

    this.cachedTickets = null

    await this.discord
      .dm(
        ticket.user,
        new Embed()
          .title('Ticket Denied')
          .description(
            'After further review, your ticket was denied\n\n' +
              'Reminder: you can always add words to your uncensor list to stop it in your server specifically'
          )
          .footer(`Ticket: ${ticket.id}`)
      )
      .catch(() => {})

    await this.db.collection('tickets').deleteOne({ id: ticket.id })
  }
}
