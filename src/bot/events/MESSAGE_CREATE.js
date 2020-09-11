const { custom: { lockCommands } } = require('../../settings')

const webhookReplaces = {
  1: '#',
  2: '\\*'
}

module.exports = async function (message) {
  if (!message.guild_id) return
  if (message.author.bot) return

  const db = await this.db.config(message.guild_id)

  if (this.config.prefix.some(x => x === message.content + ' ')) return this.interface.send(message.channel_id, `Current prefix is: \`${db.prefix || 'none'}\``)

  if (this.commands && !(lockCommands && message.author.id !== this.config.owner)) {
    const cmd = this.commands.event(message, db)

    if (this.config.deleteCommands.includes(cmd)) return this.interface.delete(message.channel_id, message.id).catch(() => {})
  }

  const channel = this.channels.get(message.channel_id)

  const inviteCensor = db.invites && message.content.match(this.utils.inviteRegex)

  if (
    !channel ||
    !message.member ||
     message.type !== 0 ||
     channel.type !== 0 ||
     (inviteCensor || !db.nsfw ? false : channel.nsfw)
  ) return this.multi.delete(message.channel_id)

  if (
    !db.censor.msg ||
    message.member.roles.includes(db.role) ||
      db.channels.includes(message.channel_id)
  ) return

  let multi
  let content

  if (db.multi) {
    multi = this.multi.get(message.channel_id)
    if (!multi) {
      multi = {}
      multi.user = message.author.id
      multi.msg = [{ id: message.id, content: message.content }]
    } else {
      if (multi.user !== message.author.id) {
        multi.user = message.author.id
        multi.msg = []
      }
      multi.msg.push({ id: message.id, content: message.content })
    }
    this.multi.set(message.channel_id, multi)

    content = multi.msg.map(x => x.content).join('\n')
  } else {
    content = message.content
  }

  const res = inviteCensor ? ({ censor: true, ranges: [], filters: ['invites'], places: [] }) : this.filter.test(content, db.filters, db.filter, db.uncensor, db.fonts)

  if (!res.censor) return

  this.internals.logCensor('msg', content, message.author, message.guild_id, res)

  let errMsg

  if (multi && multi.msg.length > 1) {
    this.interface.bulkDelete(message.channel_id, multi.msg.map(x => x.id))
  } else errMsg = await this.buckets.set(message.channel_id, message.id)

  this.multi.delete(message.channel_id)

  if (db.msg.content !== false) {
    this.buckets.pop(message.channel_id, message.author.id, db)
  }

  if (db.log) {
    this.interface.embed
      .title('Deleted Message')
      .description(`From <@${message.author.id}> in <#${message.channel_id}>${errMsg ? `\n\nError: ${errMsg}` : ''}`)
      .field('Message', this.filter.surround(content, res.ranges, '__'), true)
      .field('Filter(s)', res.filters.map(x => this.filter.filterMasks[x]).join(', '), true)
      .timestamp()
      .footer('Mistake? Do +ticket (underlined part)')
      .send(db.log)
  }

  this.punishments.guilds[message.guild_id].punish(message.author.id).post()

  if (!inviteCensor && db.webhook.enabled) {
    content = content.replace(/\|/g, '')
    if (db.webhook.separate) {
      content = this.filter.surround(content, res.ranges, '||')

      if (db.webhook.replace !== 0) content = content.split(/\|\|/g).reduce((a, b) => [(a[0] + (a[1] === 1 ? webhookReplaces[db.webhook.replace].repeat(b.length) : b)), (a[1] * -1)], ['', -1])[0]
      this.internals.sendAs(message.channel_id, message.author, message.member.nick || message.author.username, `${content}`)
    } else {
      this.internals.sendAs(message.channel_id, message.author, message.member.nick || message.author.username, `Contains Curse:\n||${content}||`)
    }
  }
}
