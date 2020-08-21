/* eslint-disable no-case-declarations */

exports.run = async function (message, args) {
  if (args[1] === '.') args[1] = message.guild_id

  switch (args[0]) {
    case 'get':
      const data = await this.client.db.config(args[1], false)
      this.send(
        this.embed
          .description('```json\n' +
            JSON.stringify(data, null, 2) +
          '```')
      )
      break
    case 'set':
      const obj = {}
      let val
      try {
        val = JSON.parse(args[3].replace(/'/g, '"'))
      } catch (e) {
        val = args[3]
      }
      obj[args[2]] = val
      await this.client.db.collection('guild_data').updateOne({
        id: args[1]
      }, {
        $set: obj
      })
      this.send(':ok_hand:')
      break
    default:
      this.send('Invalid Arg')
  }
}

exports.info = {
  name: 'db',
  description: 'Database control',
  aliases: [],
  admin: true
}
