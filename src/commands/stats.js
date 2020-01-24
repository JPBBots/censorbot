exports.run = async (client, message, args) => {
  const moment = require('moment')
  require('moment-duration-format')
  const m = await message.channel.send(new client.discord.MessageEmbed({
    title: 'Loading please wait...',
    color: 14976715
  }))
  let members = await client.shard.broadcastEval('const g = this.guilds.get(\'399688888739692552\'); if(g) g.memberCount')
  members = members.filter(x => x !== null)[0]
  var results = await client.shard.fetchClientValues('guilds.size')
  const gc = results.reduce((prev, guildCount) => prev + guildCount, 0)
  results = await client.shard.fetchClientValues('users.size')
  const uc = results.reduce((prev, guildCount) => prev + guildCount, 0)
  const stats = {
    embed: {
      title: client.config.name + ' Stats',
      description: client.config.name + ' Is In ' + gc.toLocaleString() + ' servers and serving ' + uc.toLocaleString() + ' users!',
      url: client.config.invitesite + '',
      color: 14976715,
      author: {
        name: client.config.name + '',
        url: client.config.website + '',
        icon_url: client.user.avatarURL() + ''
      },
      fields: [
        {
          name: ':chart_with_downwards_trend: Memory Usage (This Shard)',
          value: (await client.shard.broadcastEval('(process.memoryUsage().heapUsed) / 1024 / 1024')).reduce((a = 0, b) => a + b, 0).toFixed(2) + ' MB',
          inline: true
        },
        {
          name: ':envelope_with_arrow: Ping',
          value: m.createdTimestamp - message.createdTimestamp + 'ms',
          inline: true
        },
        {
          name: ':incoming_envelope: API Latency',
          value: Math.round(client.ws.ping) + 'ms',
          inline: true
        },
        {
          name: ':couple: Support Server Members',
          value: members,
          inline: true
        },
        {
          name: ':books: Library',
          value: 'discord.js',
          inline: true
        },
        {
          name: ':clock1: Uptime',
          value: moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]'),
          inline: true
        },
        {
          name: ':control_knobs: Node Version',
          value: process.version,
          inline: true
        },
        {
          name: ':large_blue_diamond: Shard Count',
          value: client.shard.count + ' (`' + client.config.prefix + 'shards`)',
          inline: true
        },
        {
          name: ':wastebasket: Messages Deleted',
          value: (await client.statdb.get('deleted', 'amount')).toLocaleString(),
          inline: true
        }
      ]
    }
  }
  m.edit(stats)
}
exports.info = {
  name: 'stats',
  description: 'Displays {name} stats',
  format: '{prefix}stats',
  aliases: ['info', 'about']
}
