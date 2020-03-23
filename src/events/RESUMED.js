module.exports = function (_, ws) {
  this.interface.send(this.config.statusChannel, `Resumed | Shard: ${ws.shard.id}`)
}
