module.exports = async function (message) {
  const channel = this.channels.get(message.channel_id)

  if (
    !channel ||
    !message.member ||
     message.type !== 0 ||
     channel.type !== 0 ||
     message.author.bot ||
     channel.nsfw
  ) return

  const db = await this.db.config(message.guild_id)

  if (
    !db.censor.emsg ||
    message.member.roles.includes(db.role) ||
      db.channels.includes(message.channel_id)
  ) return

  let multiline = false
  let multi
  let content = ''

  if (db.multi) {
    if (this.multi.has(message.channel_id)) {
      multi = this.multi.get(message.channel_id)
      if (Object.prototype.hasOwnProperty.call(multi.msg, message.id)) {
        multiline = true
        multi.msg[message.id] = message.content

        this.multi.set(message.channel_id, multi)

        content += Object.values(multi.msg).join('')
      }
    }
  }

  if (!multiline) content += message.content

  const res = this.filter.test(content, db.base, db.languages, db.filter, db.uncensor)

  if (!res.censor) return

  this.log(6, 13, `Edited Message; ${content}`, `${message.author.username}#${message.author.discriminator};${message.author.id};${res.method}`)
  this.webhooks.send('log', {
    content: '```' + content + '```',
    embeds: [this.embed
      .description(`<@${message.author.id}>(${message.author.id}) in ${message.guild_id}`)
      .title('Edited Message')
      .field('Method', res.method)
      .field('Arg', res.arg.map(x => x.toString()).join(', '))
      .render()]
  })

  let errMsg

  if (multiline) {
    this.interface.bulkDelete(message.channel_id, Object.keys(multi.msg))
  } else {
    errMsg = await this.interface.delete(message.channel_id, message.id)
      .then(_ => false)
      .catch(err => err.message)
  }

  this.multi.delete(message.channel_id)

  if (db.msg !== false) {
    const popMsg = await this.interface.send(message.channel_id,
      this.embed
        .color('RED')
        .description(`<@${message.author.id}> ${db.msg || this.config.defaultMsg}`)
    )
    if (popMsg.id) {
      if (db.pop_delete) {
        setTimeout(() => {
          this.interface.delete(message.channel_id, popMsg.id)
            .catch(() => {})
        }, db.pop_delete)
      }
    }
  }

  if (db.log) {
    this.interface.send(db.log,
      this.embed
        .title('Deleted Edited Message')
        .description(`From <@${message.author.id}> in <#${message.channel_id}>${errMsg ? `\n\nError: ${errMsg}` : ''}`)
        .field('Message', content, true)
        .field('Method', res.method, true)
        .timestamp()
        .footer('https://patreon.com/censorbot')
    )
  }

  this.punishments.addOne(message.guild_id, message.author.id, db)
}
