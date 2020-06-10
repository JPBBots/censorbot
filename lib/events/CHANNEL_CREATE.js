const keepProps = [
  'id',
  'type',
  'guild_id',
  'position',
  'name',
  'nsfw'
]

module.exports = function (channel) {
  if (channel.type !== 0) return

  Object.keys(channel).forEach(key => {
    if (!keepProps.includes(key)) delete channel[key]
  })

  this.channels.set(channel.id, channel)
}
