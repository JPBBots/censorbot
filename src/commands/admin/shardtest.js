exports.run = async (client, message, args) => {
  client.shard.fetchClientValues('ws.reconnecting')
    .then(result => {
      var str = 'Shard test\n'
      Object.keys(result).forEach(x => {
        str += `Shard ${x} | ${result[x] ? 'DISCONNECTED' : 'CONNECTED'}\n`
      })

      message.reply(str, { code: true })
    })
}
exports.info = {
  name: 'shardtest',
  description: 'Finds broken shards',
  format: '{prefix}shardtest'
}
