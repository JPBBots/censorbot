module.exports = async function (reaction) {
  this.tickets.event(reaction)
  const channel = this.channels.get(reaction.channel_id)

  if (
    !channel ||
     channel.nsfw ||
    !reaction ||
    !reaction.message_id ||
    !reaction.member ||
     reaction.member.user.bot
  ) return

  const db = await this.db.config(reaction.guild_id)

  if (
    !db.censor.react ||
    reaction.member.roles.includes(db.role) ||
    db.channels.includes(reaction.channel_id)
  ) return

  let content = ''

  content += reaction.emoji.name

  const res = this.filter.test(content, db.filters, db.filter, db.uncensor)

  if (!res.censor) return

  this.internals.logCensor('react', content, reaction.member.user, reaction.guild_id, res)

  const errMsg = await this.interface.removeReaction(reaction.channel_id, reaction.message_id, reaction.emoji.id || reaction.emoji.name, reaction.user_id)
    .then(_ => false)
    .catch(err => err.message)

  if (db.log) {
    this.interface.send(db.log,
      this.embed
        .title('Removed Reaction')
        .description(`User <@${reaction.user_id}> in <#${reaction.channel_id}> on [message](${
          `https://discord.com/channels/${reaction.guild_id}/${reaction.channel_id}/${reaction.message_id}`
        }) ${errMsg ? `\n\nError: ${errMsg}` : ''}`)
        .field('Reaction', content, true)
        .field('Filter(s)', res.filters.map(x => this.filter.filterMasks[x]).join(', '), true)
        .timestamp()
        .footer('https://patreon.com/censorbot')
    )
  }

  this.punishments.addOne(reaction.guild_id, reaction.user_id, db)
}
