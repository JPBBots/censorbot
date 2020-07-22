module.exports = async function (message) {
  const db = await this.db.config(message.guild_id)

  if (this.config.prefix.some(x => x === message.content + ' ')) return this.interface.send(message.channel_id, `Current prefix is: \`${db.prefix || 'none'}\``)

  if (this.commands) {
    const cmd = this.commands.event(message, db.prefix)

    if (this.config.deleteCommands.includes(cmd)) return this.interface.delete(message.channel_id, message.id).catch(() => {})
  }

  const channel = this.channels.get(message.channel_id)

  const inviteCensor = db.invites && message.content.match(this.utils.inviteRegex)

  if (
    !channel ||
    !message.member ||
     message.type !== 0 ||
     channel.type !== 0 ||
     message.author.bot ||
     (inviteCensor ? false : channel.nsfw)
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
      multi.msg = [ { id: message.id, content: message.content } ]
    } else {
      if (multi.user !== message.author.id) {
        multi.user = message.author.id
        multi.msg = []
      }
      multi.msg.push({ id: message.id, content: message.content })
    }
    this.multi.set(message.channel_id, multi)

    content = multi.msg.map(x => x.content).join(' ')
  } else {
    content = message.content
  }

  const res = inviteCensor ? ({ censor: true, ranges: [], filters: ['invites'], places: [] }) : this.filter.test(content, db.filters, db.filter, db.uncensor)

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
    this.interface.send(db.log,
      this.embed
        .title('Deleted Message')
        .description(`From <@${message.author.id}> in <#${message.channel_id}>${errMsg ? `\n\nError: ${errMsg}` : ''}`)
        .field('Message', this.filter.surround(content, res.ranges, '__'), true)
        .field('Filter(s)', res.filters.map(x => this.filter.filterMasks[x]).join(', '), true)
        .timestamp()
        .footer('Mistake? Do +ticket (underlined part)')
    )
  }

  this.punishments.addOne(message.guild_id, message.author.id, db)

  if (!inviteCensor && db.webhook.enabled) {
    content = content.replace(/\|/g, '')
    if (db.webhook.separate) {
      content = this.filter.surround(content, res.ranges, '||')

      if (db.webhook.replace === 1) content = content.split(/\|\|/g).reduce((a, b) => [(a[0] + (a[1] === 1 ? '#'.repeat(b.length) : b)), (a[1] * -1)], ['', -1])[0]
      this.webhooks.sendAs(message.channel_id, message.author, message.member.nick || message.author.username, `${content}`)
    } else {
      this.webhooks.sendAs(message.channel_id, message.author, message.member.nick || message.author.username, `Contains Curse:\n||${content}||`)
    }
  }
}
