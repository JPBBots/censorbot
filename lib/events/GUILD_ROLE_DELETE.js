module.exports = function (role) {
  const guild = this.guilds.get(role.guild_id)
  if (!guild) return

  guild.roles = guild.roles.filter(x => x.id !== role.role_id)

  this.guilds.set(guild.id, guild)
}
