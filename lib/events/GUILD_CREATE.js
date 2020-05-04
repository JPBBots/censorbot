const keepProps = [
  'roles',
  'name',
  'owner_id',
  'id',
  'region',
  'unavailable',
  'member_count'
]

module.exports = function (guild) {
  guild.channels.forEach(channel => {
    this.internalEvents.CHANNEL_CREATE(channel)
  })

  Object.keys(guild).forEach(key => {
    if (!keepProps.includes(key)) delete guild[key]
  })

  this.guilds.set(guild.id, guild)
}
