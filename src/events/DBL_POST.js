module.exports = function () {
  this.interface.editChannel(this.config.channels.serverCount, {
    name: `Server Count: ${this.guilds.size.toLocaleString()}`
  })

  this.presence.go()
}
