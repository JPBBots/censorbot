module.exports = function (role) {
  const guild = this.guilds.get(role.guild_id)
  if (!guild) return

  guild.roles = guild.roles.filter(x => x.id !== role.role.id)
  guild.roles.push(role.role)

  this.guilds.set(guild.id, guild)
}
