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

  const res = this.filter.test(content, db.filters, db.filter, db.uncensor)

  if (!res.censor) return

  this.internals.logCensor('emsg', content, member.user, member.guild_id, res)

  const errMsg = await this.interface.nickname(member.guild_id, member.user.id, '')
    .then(_ => false)
    .catch(err => err.message)

  if (db.log) {
    this.interface.send(db.log,
      this.embed
        .title('Removed Nickname')
        .description(`User <@${member.user.id}>${errMsg ? `\n\nError: ${errMsg}` : ''}`)
        .field('Nickname', this.filter.surround(content, res.ranges, '__'), true)
        .field('Filter(s)', res.filters.map(x => this.filter.filterMasks[x]).join(', '), true)
        .timestamp()
        .footer('https://patreon.com/censorbot')
    )
  }

  this.punishments.addOne(member.guild_id, member.user.id, db)
}
