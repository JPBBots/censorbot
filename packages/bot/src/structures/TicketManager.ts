import { Collection } from 'mongodb'
import { WorkerManager } from '../managers/Worker'

import { Ticket, BASE_FILTERS, TicketBanSchema } from '@censorbot/typings'
import { APIUser, Snowflake } from 'discord-api-types/v9'

import { NonFatalError, generateShortId } from '@censorbot/utils'

import { Embed } from '@jadl/builders'

export class TicketManager {
  constructor(private readonly worker: WorkerManager) {
    this.worker.on('MESSAGE_CREATE', async (msg) => {
      if (
        msg.channel_id === this.worker.config.channels.tickets &&
        msg.webhook_id === this.worker.config.webhooks.tickets.id
      ) {
        void (await worker.requests.react(
          msg.channel_id,
          msg.id,
          this.worker.config.emojis.yes
        ))
        void (await worker.requests.react(
          msg.channel_id,
          msg.id,
          this.worker.config.emojis.no
        ))
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.worker.on('MESSAGE_REACTION_ADD', async (reaction) => {
      if (
        reaction.channel_id !== this.worker.config.channels.tickets ||
        reaction.member?.user?.bot
      )
        return
      if (!reaction.member?.user?.id) return

      const ticket = await this.db.findOne({ msg: reaction.message_id })
      if (!ticket) return

      switch (reaction.emoji.id) {
        case this.worker.config.emojis.yes:
          this.approve(ticket, reaction.member.user)
          break
        case this.worker.config.emojis.no:
          this.deny(ticket, reaction.member.user)
          break
        default:
          break
      }
    })
  }

  get db(): Collection<Ticket> {
    return this.worker.db.collection('tickets')
  }

  get bans(): Collection<TicketBanSchema> {
    return this.worker.db.collection('ticketban')
  }

  async create(word: string, user: Snowflake): Promise<string> {
    const ban = await this.bans.findOne({ id: user })
    if (ban?.banned)
      throw new NonFatalError(`User is banned for "${ban.reason}"`)

    const res = this.worker.filter.test(word, {
      base: [...BASE_FILTERS],
      server: [],
      uncensor: [],
      phrases: [],
      words: []
    })
    if (!res)
      throw new NonFatalError('Phrase is not censored by the base filter.')

    const tickets = await this.db.find({}).toArray()
    const id = generateShortId(tickets.map((x) => x.id))

    const msg = await this.worker
      .webhook('tickets')
      .title(`Ticket (${id})`)
      .description(`<@${user}> \`\`\`${word}\`\`\``)
      .timestamp()
      .send()

    await this.db.insertOne({
      id,
      word,
      user,
      msg: msg.id,
      accepted: false,
      admin: undefined
    })

    return id
  }

  approve(ticket: Ticket, admin: APIUser): void {
    void this.worker
      .webhook('ticketLog')
      .title(`Accepted (${ticket.id})`)
      .description(
        `<@${ticket.user}> accepted by <@${admin.id}> \`\`\`${ticket.word}\`\`\``
      )
      .timestamp()
      .send()

    void this.worker.requests.dm(
      ticket.user,
      new Embed()
        .title(`Ticket was accepted (${ticket.id})`)
        .description(ticket.word)
        .field(
          'Admin',
          `<@${admin.id}> (${admin.username}#${admin.discriminator})`
        )
        .footer(
          'Please wait as we need to add the bypass, you will receive a DM once the word has been added.'
        )
        .timestamp()
    )

    if (ticket.msg)
      void this.worker.requests
        .deleteWebhookMessage(
          this.worker.config.webhooks.tickets.id,
          this.worker.config.webhooks.tickets.token,
          ticket.msg
        )
        .catch((err) => console.log('boop', err.message))

    void this.db.updateOne(
      { id: ticket.id },
      {
        $set: {
          accepted: true,
          admin: admin.id,
          msg: undefined
        }
      }
    )
  }

  deny(ticket: Ticket, admin: APIUser): void {
    void this.worker
      .webhook('ticketLog')
      .title(`Denied (${ticket.id})`)
      .description(
        `<@${ticket.user}> denied by <@${admin.id}> \`\`\`${ticket.word}\`\`\``
      )
      .timestamp()
      .send()

    void this.worker.requests.dm(
      ticket.user,
      new Embed()
        .title(`Ticket was denied (${ticket.id})`)
        .description(ticket.word)
        .field(
          'Admin',
          `<@${admin.id}> (${admin.username}#${admin.discriminator})`
        )
        .footer(
          'Reminder that you can always add words to your uncensor list to stop it in your server specifically.'
        )
        .timestamp()
    )

    if (ticket.msg)
      void this.worker.requests.deleteWebhookMessage(
        this.worker.config.webhooks.tickets.id,
        this.worker.config.webhooks.tickets.token,
        ticket.msg
      )

    void this.db.deleteOne({ id: ticket.id })
  }
}
