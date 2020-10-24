module.exports = async function (member) {
  if (
    !member ||
     member.user.bot
  ) return

  const db = await this.db.config(member.guild_id)

  if (db.punishment.type === 1 && db.punishment.role) {
    const timeout = await this.db.collection('timeouts').findOne({
      guild: member.guild_id,
      user: member.user.id,
      type: 1
    })

    if (timeout && !member.roles.includes(db.punishment.role)) {
      this.punishments.guilds[member.guild_id].unmute(member.user.id).post({ query: { extra: '1' } })
    }
  }

  if (
    !member.nick ||
    !db.censor.nick ||
    member.roles.includes(db.role)
  ) return

  let content = ''

  content += member.nick

  const res = this.filter.test(content, db.filters, db.filter, db.uncensor, db.fonts)

  if (!res.censor) return

  this.internals.logCensor('emsg', content, member.user, member.guild_id, res)

  const errMsg = await this.interface.nickname(member.guild_id, member.user.id, '')
    .then(_ => false)
    .catch(err => err.message)

  if (db.log) {
    this.interface.embed
      .title('Removed Nickname')
      .description(`User <@${member.user.id}>${errMsg ? `\n\nError: ${errMsg}` : ''}`)
      .field('Nickname', this.filter.surround(content, res.ranges, '__'), true)
      .field('Filter(s)', res.filters.map(x => this.filter.filterMasks[x]).join(', '), true)
      .timestamp()
      .footer('https://patreon.com/censorbot')
      .send(db.log)
  }

  this.punishments.guilds[member.guild_id].punish(member.user.id).post()
}
