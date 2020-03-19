module.exports = function () {
  this.api
    .channels[this.config.serverCountChannel]
    .patch({
      body: {
        name: `Server Count: ${this.guilds.size.toLocaleString()}`
      }
    })

  this.presence.go()
}
