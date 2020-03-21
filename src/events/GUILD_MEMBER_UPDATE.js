module.exports = async function (member) {
  if (
    !member ||
    !member.nick ||
     member.user.bot
  ) return

  const db = await this.db.config(member.guild_id)

  if (
    !db.censor.nick ||
    member.roles.includes(db.role)
  ) return

  let content = ''

  content += member.nick

  const res = this.filter.test(content, db.base, db.languages, db.filter, db.uncensor)

  if (!res.censor) return

  this.log(6, 13, `Nickname; ${content}`, `${member.user.username}#${member.user.discriminator};${member.user.id};${res.method}`)

  const errMsg = await this.interface.nickname(member.guild_id, member.user.id, '')
    .then(_ => false)
    .catch(err => err.message)

  if (db.log) {
    this.interface.send(db.log,
      this.embed
        .title('Removed Nickname')
        .description(`User <@${member.user.id}>${errMsg ? `\n\nError: ${errMsg}` : ''}`)
        .field('Nickname', content, true)
        .field('Method', res.method, true)
        .timestamp()
        .footer('https://patreon.com/censorbot')
    )
  }

  this.punishments.addOne(member.guild_id, member.user.id, db)
}
