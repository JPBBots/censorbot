module.exports = function (shard) {
  if (!this.done) {
    shard.setStatus({
      afk: false,
      status: 'idle',
      since: 0,
      game: {
        type: 0,
        name: 'Starting up... | Please wait!'
      }
    })
  } else {
    this.cluster.internal.setPresence()
  }
  this.interface.send(this.config.channels.status, `Startup | Cluster: ${this.cluster.id} | Shard: ${shard.id}`)
}
