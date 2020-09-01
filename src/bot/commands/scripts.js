const scripts = {
  membercount: {
    desc: 'Get total member count',
    run: async (client, message, args) => {
      return client.cluster.internal
        .eval('client.guilds.reduce((a,b) => a+b.member_count, 0)')
        .then(x => x.reduce((a, b) => a + b, 0)).then(x => x.toLocaleString())
    }
  },
  cleanuncensor: {
    desc: 'Clears out unnecessary uncensor words',
    run: async (client, message, args) => {
      const guild = args[1] || message.guild_id

      const db = await client.db.config(guild)

      const uncensor = db.uncensor.filter(x => client.filter.test(x, db.filters, db.filter).censor)

      await client.db.collection('guild_data').updateOne({
        id: guild
      }, {
        $set: {
          uncensor
        }
      })

      return `${db.uncensor.length - uncensor.length} removed`
    }
  },
  cleanfilter: {
    desc: 'Clears out unnecessary filter words',
    run: async (client, message, args) => {
      const guild = args[1] || message.guild_id

      const db = await client.db.config(guild)

      const filter = db.filter.filter(x => !client.filter.test(x, db.filters).censor)

      await client.db.collection('guild_data').updateOne({
        id: guild
      }, {
        $set: {
          filter
        }
      })

      return `${db.filter.length - filter.length} removed`
    }
  }
}

exports.run = async function (message, args) {
  if (!args[0]) {
    return this.send(
      this.embed
        .title('Scripts')
        .description(Object.keys(scripts).map(x => `\`${x}\`: ${scripts[x].desc}`).join('\n'))
    )
  }

  const script = scripts[args[0]]

  if (!script) return this.send('no script by that name')

  const res = await script.run(this.client, message, args)

  this.send(
    this.embed
      .title(`Result of ${args[0]}`)
      .description('```xl\n' + res + '```')
  )
}

exports.info = {
  name: 'scripts',
  description: 'Runs a script',
  format: '{prefix}scripts [script] (data)',
  aliases: [],
  admin: true
}
