exports.run = async function (message, args) {
  const db = await this.client.db.config(message.guild_id)

  const res = this.client.filter.test(args.join(' '), db.filters, db.filter, db.uncensor)
  this.send(
    this.embed
      .description('```json\n' +
        JSON.stringify(res, null, 4) +
      '```')
  )
}

exports.info = {
  admin: true,
  description: 'Test filter',
  name: 'test',
  aliases: []
}
