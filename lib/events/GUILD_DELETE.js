module.exports = function (guild) {
  if (guild.unavailable) return
  this.guilds.delete(guild.id)
  this.channels = this.channels.filter(x => x.guild_id !== guild.id)
}
