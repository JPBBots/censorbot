module.exports = function (guild) {
  const currentGuild = this.guilds.get(guild.id)
  if (!currentGuild) return this.internalEvents.GUILD_CREATE(guild)

  currentGuild.name = guild.name
  currentGuild.region = guild.region
  currentGuild.owner_id = guild.owner_id

  this.guilds.set(guild.id, currentGuild)
}
