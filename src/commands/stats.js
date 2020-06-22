const moment = require('moment')
require('moment-duration-format')

exports.run = async function (message, args) {
  const m = await this.send(this.embed
    .title('Loading please wait...')
    .color(14976715)
  )

  const timestamp = new Date(m.timestamp).getTime()

  const stats = {
    embed: {
      title: this.client.user.username + ' Stats',
      description: this.client.user.username + ' Is In ' + (await this.client.cluster.internal.guildCount(true)).toLocaleString() + ' servers',
      url: this.client.config.inviteSite + '',
      color: 14976715,
      author: {
        name: this.client.user.username + '',
        url: this.client.config.website + ''
      },
      footer: {
        text: 'For shard info do +shards, for performance info do +info'
      },
      fields: [
        {
          name: ':envelope_with_arrow: Ping',
          value: timestamp - new Date(message.timestamp).getTime() + 'ms',
          inline: true
        },
        {
          name: ':incoming_envelope: API Latency',
          value: Math.round(this.client.ping) + 'ms',
          inline: true
        },
        {
          name: ':clock1: Uptime',
          value: moment.duration(process.uptime() * 1000).format(' D [days], H [hrs], m [mins]'),
          inline: true
        },
        {
          name: ':large_blue_diamond: Shard Count',
          value: this.client.options.shardCount + ' shards',
          inline: true
        },
        {
          name: ':wastebasket: Things Censored',
          value: (await this.client.db.collection('stats').findOne({ id: 'deleted' }).then(x => x.amount)).toLocaleString(),
          inline: true
        },
        {
          name: ':clock: Time Existed',
          value: moment.duration(new Date().getTime() - 1514012068071).format('Y [yrs] D [days]'),
          inline: true
        }
      ]
    }
  }

  this.client.interface.edit(message.channel_id, m.id, stats)
}
exports.info = {
  name: 'stats',
  description: 'Displays {name} stats',
  format: '{prefix}stats',
  aliases: ['about']
}
