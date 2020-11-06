module.exports = function (guild) {
  const currentGuild = this.guilds.get(guild.id)
  if (!currentGuild) return this.internalEvents.GUILD_CREATE(guild)

  currentGuild.name = guild.name
  currentGuild.region = guild.region
  currentGuild.owner_id = guild.owner_id
  currentGuild.member_count = guild.member_count

  this.guilds.set(guild.id, currentGuild)
}
