module.exports = function (shard) {
  if (!this.ready) {
    shard.setStatus({
      afk: false,
      status: 'idle',
      since: 0,
      game: {
        type: 0,
        name: 'Starting up... | Please wait!'
      }
    })
  }
}