module.exports = function () {
  this.interface.editChannel(this.config.serverCountChannel, {
    name: `Server Count: ${this.guilds.size.toLocaleString()}`
  })

  this.presence.go()
}
