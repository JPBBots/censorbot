/**
 * {
 *   id: '',
 *   word: '',
 *   user: ''
 * }
 */

const GenerateID = require('../../../util/GenerateID')

class TicketManager {
  constructor (client) {
    this.client = client
  }

  get db () {
    return this.client.db.collection('tickets')
  }

  get banDB () {
    return this.client.db.collection('ticketban')
  }

  async isBanned (id) {
    const res = await this.banDB.findOne({ id })
    return res || { banned: false, reason: null }
  }

  async add (word, user) {
    const isBanned = await this.isBanned(user)
    if (isBanned.banned) throw new Error(`User is banned for \`${isBanned.reason}\``)

    const res = this.client.filter.test(word, true, this.client.db.defaultConfig.languages, false, false)
    if (!res.censor) throw new Error('Phrase is not censored by the base filter')

    const tickets = await this.db.find({}).toArray()
    const id = GenerateID(tickets.map(x => x.id))

    const msg = await this.client.interface.send(this.client.config.channels.ticket,
      this.client.embed
        .title(`Ticket (${id})`)
        .description(`<@${user}> \`\`\`${word}\`\`\``)
        .timestamp()
    )
    this.client.interface.addReaction(this.client.config.channels.ticket, msg.id, this.client.config.emojis.yes)
    this.client.interface.addReaction(this.client.config.channels.ticket, msg.id, this.client.config.emojis.no)

    this.db.insertOne({
      id,
      word,
      user,
      msg: msg.id
    })
  }

  async deny (id, admin) {
    const ticket = await this.db.findOne({ id })
    console.log(ticket)

    this.client.interface.send(this.client.config.channels.ticketLog,
      this.client.embed
        .title(`Denied (${id})`)
        .description(`<@${ticket.user}> denied by <@${admin.id}> \`\`\`${ticket.word}\`\`\``)
        .timestamp()
    )

    this.client.interface.delete(this.client.config.channels.ticket, ticket.msg)

    this.db.removeOne({ id })
  }

  async approve (id, admin) {
    const ticket = await this.db.findOne({ id })

    this.client.interface.send(this.client.config.channels.ticketLog,
      this.client.embed
        .title(`Accepted (${id})`)
        .description(`<@${ticket.user}> accepted by <@${admin.id}> \`\`\`${ticket.word}\`\`\``)
        .timestamp()
    )

    this.client.interface.send(this.client.config.channels.approved,
      this.client.embed
        .title(`Ticket (${id})`)
        .description(`<@${ticket.user}> accepted by <@${admin.id}> \`\`\`${ticket.word}\`\`\``)
        .timestamp()
    )

    this.client.interface.delete(this.client.config.channels.ticket, ticket.msg)

    this.db.removeOne({ id })
  }

  async event (reaction) {
    if (reaction.channel_id !== this.client.config.channels.ticket || reaction.member.user.bot) return

    const { id } = await this.db.findOne({ msg: reaction.message_id })

    switch (reaction.emoji.id) {
      case this.client.config.emojis.yes:
        this.approve(id, reaction.member.user)
        break
      case this.client.config.emojis.no:
        this.deny(id, reaction.member.user)
        break
    }
  }
}

module.exports = TicketManager
