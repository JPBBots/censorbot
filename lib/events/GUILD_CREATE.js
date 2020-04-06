module.exports = function (guild) {
  guild.members.forEach(member => {
    this.addUserGuild(member.user.id, guild.id)
  })
  delete guild.members

  this.guilds.set(guild.id, guild)
  guild.channels.forEach(channel => {
    channel.guild_id = guild.id
    this.channels.set(channel.id, channel)
  })
}
