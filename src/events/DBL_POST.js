module.exports = async function () {
  this.interface.editChannel(this.config.channels.serverCount, {
    name: `Server Count: ${(await this.cluster.internal.guildCount(true)).toLocaleString()}`
  })

  this.presence.go()
}
