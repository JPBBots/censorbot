module.exports = async function (member) {
  const db = await this.db.config(member.guild_id)

  if (db.punishment.type !== 1 || !db.punishment.role) return

  const currentEntry = await this.db.collection('timeouts').findOne({
    guild: member.guild_id,
    user: member.user.id,
    type: 1
  })

  if (!currentEntry) return

  this.interface.addRole(member.guild_id, member.user.id, db.punishment.role, 'Muted user rejoined')
}
