module.exports = async function (message) {
  const channel = this.channels.get(message.channel_id)

  if (
    !channel ||
    !message.member ||
     message.type !== 0 ||
     channel.type !== 0 ||
     message.author.bot
  ) return

  const db = await this.db.config(message.guild_id)

  const inviteCensor = db.invites && message.content.match(this.utils.inviteRegex)

  if (inviteCensor || !db.nsfw ? false : channel.nsfw) return

  if (
    !db.censor.emsg ||
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
      multi.msg = []
    }

    const piece = multi.msg.find(x => x.id === message.id)

    if (!piece) multi.msg.push({ id: message.id, content: message.content })
    else piece.content = message.content

    this.multi.set(message.channel_id, multi)

    content = multi.msg.map(x => x.content).join(' ')
  } else {
    content = message.content
  }

  const res = inviteCensor ? ({ censor: true, method: 'invites', word: 'invite', arg: [] }) : this.filter.test(content, db.filters, db.filter, db.uncensor, db.fonts)

  if (!res.censor) return

  this.internals.logCensor('emsg', content, message.author, message.guild_id, res)

  let errMsg

  if (multi && multi.msg.length > 1) {
    this.interface.bulkDelete(message.channel_id, multi.msg.map(x => x.id))
  } else {
    errMsg = await this.interface.delete(message.channel_id, message.id)
      .then(_ => false)
      .catch(err => err.message)
  }

  this.multi.delete(message.channel_id)

  if (db.msg.content !== false) {
    const popMsg = await this.interface.send(message.channel_id,
      this.embed
        .color('RED')
        .description(`<@${message.author.id}> ${db.msg.content || this.config.defaultMsg}`)
    )
    if (popMsg.id) {
      if (db.msg.deleteAfter) {
        setTimeout(() => {
          this.interface.delete(message.channel_id, popMsg.id)
            .catch(() => {})
        }, db.msg.deleteAfter)
      }
    }
  }

  if (db.log) {
    this.interface.send(db.log,
      this.embed
        .title('Deleted Edited Message')
        .description(`From <@${message.author.id}> in <#${message.channel_id}>${errMsg ? `\n\nError: ${errMsg}` : ''}`)
        .field('Message', this.filter.surround(content, res.ranges, '__'), true)
        .field('Filter(s)', res.filters.map(x => this.filter.filterMasks[x]).join(', '), true)
        .timestamp()
        .footer('https://patreon.com/censorbot')
    )
  }

  this.punishments.guilds[message.guild_id].punish(message.author.id).post()
}
