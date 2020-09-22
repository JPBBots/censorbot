const scripts = {
  statuses: {
    desc: 'Get http response codes',
    run: async (client) => {
      const statuses = await client.cluster.internal.eval('client.rest.statuses')
        .then(x => {
          return x.reduce((a, b) => {
            Object.keys(b).forEach(key => {
              if (!a[key]) a[key] = 0
              a[key] += b[key]
            })
            return a
          }, {})
        })

      return `${Object.keys(statuses).map(x => `${x}: ${statuses[x].toLocaleString()}`).join('\n')}`
    }
  },
  filtertime: {
    desc: 'Get average filter time',
    run: async (client) => {
      const data = await client.cluster.internal.eval('[client.filter.avg, client.filter.avgCounter]')
      const avgs = data.map(x => x[0])
      return `${(avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(3)}ms average time over the last ${data.map(x => x[1]).reduce((a, b) => a + b, 0).toLocaleString()} messages`
    }
  },
  membercount: {
    desc: 'Get total member count',
    run: async (client) => {
      return `${await client.cluster.internal
        .eval('client.guilds.reduce((a,b) => a+b.member_count, 0)')
        .then(x => x.reduce((a, b) => a + b, 0)).then(x => x.toLocaleString())} users`
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
