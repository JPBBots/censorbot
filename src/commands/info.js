exports.run = async function (message, args) {
  const info = await this.client.cluster.internal.info()

  const embed = this.embed
    .title('Performance Info')
    .description(`Total: ${(info.reduce((a, b) => a + b.usage, 0) / 1024 / 1024).toFixed(0)}MB`)

  info.forEach(x => {
    embed.field(typeof x.id === 'number' ? `Cluster ${x.id}` : x.id, `${(x.usage / 1024 / 1024).toFixed(0)}MB`, true)
  })

  this.send(embed)
}
exports.info = {
  name: 'info',
  description: 'Displays performance info.',
  format: '{prefix}info',
  aliases: ['i']
}
