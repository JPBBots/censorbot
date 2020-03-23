module.exports = function (_, ws) {
  this.interface.send(this.config.channels.status, `Resumed | Shard: ${ws.shard.id}`)
}
