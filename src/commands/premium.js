async function isPremium (client, user) {
  var res = await client.shard.broadcastEval(`
        function getValues(c) {
            var g = c.guilds.get("399688888739692552");
            if(!g) return null;
            var mem = g.members.get("${user.id}");
            if(!mem) return null;
            return mem.roles.keyArray();
        }
        getValues(this);
    `)
  res = res.find(x => x)
  if (!res) return false
  var amount = 0
  res.forEach(x => {
    if (client.config.premiumRoles[x]) amount += client.config.premiumRoles[x]
  })
  return amount || false
}

exports.run = async (client, message, args) => {
  var cur = await client.pdb.getAll(message.guild.id)
  var curUser = await isPremium(client, message.author)
  cur = cur ? cur.premium : false
  if (!args[0]) {
    return message.channel.send(
      client.u.embed
        .setTitle('Premium')
        .setDescription('Premium is a version of the bot that is completely the same, but unlocks a multitude of other features\n' +
                'Learn more about, and how to get, premium [here](https://censorbot.jt3ch.net/premium).'
        )
        .addField('Is this server premium', cur ? 'true' : 'false', true)
        .addField('Are you premium', curUser ? 'true' : 'false', true)
        .setColor('BLURPLE')
        .setFooter('https://censorbot.jt3ch.net/premium')
    )
  }
  if (args[0] == 'set') {
    if (!curUser) return message.reply('You must have premium to use this!')
    var prem = await client.pudb.getAll(message.author.id)
    if (!prem) {
      prem = { id: message.author.id, guilds: [] }
      await client.pudb.create(message.author.id, prem)
    }
    var gs = prem.guilds
    if (!prem) return message.reply('DB error, contact support')
    var gdb = await client.pdb.getAll(message.guild.id)
    if (gdb && gdb.premium) return message.reply('Error, this guild is already premium!')
    if (gs.length >= curUser) return message.reply("You've already maxed out your premium usage! Remove some with +premium remove")
    gs.push(message.guild.id)
    console.log(gs)
    await client.pudb.set(message.author.id, 'guilds', gs)
    await client.pdb.create(message.guild.id, { premium: true })
    return message.reply('Added this server to premium!')
  }
  if (args[0] == 'remove') {
    if (!curUser) return message.reply('You must have premium to use this!')
    var prem = await client.pudb.getAll(message.author.id)
    if (!prem) {
      prem = { id: message.author.id, guilds: [] }
      await client.pudb.create(message.author.id, prem)
    }
    var gs = prem.guilds
    var msg = await message.reply('Loading...')
    if (!args[1]) {
      var r = []
      if (gs.length > 0) {
        gs = (await client.shard.broadcastEval(`
                function getValues(c) {
                    return c.guilds.filter(x=>${JSON.stringify(gs)}.includes(x.id)).map(x=>{return {name: x.name, id: x.id}});
                }
                getValues(this);
            `)).filter(x => x.length > 0).forEach(_ => { _.forEach(a => { r[gs.indexOf(a.id)] = (gs.indexOf(a.id) + 1) + ': ' + a.name }) })
      } else r = ['None']
      return msg.edit('Do +premium remove #, Numbers:\n\n' + r.join('\n'))
    } else {
      if (isNaN(args[1])) return msg.edit('Invalid number')
      var num = Number(args[1]) - 1
      if (!gs[num]) return msg.edit('Invalid guild number')
      await client.pdb.delete(gs[num])
      gs[num] = null
      console.log(gs)
      await client.pudb.set(message.author.id, 'guilds', gs.filter(x => x))
      msg.edit('Removed')
    }
  }
  if (args[0] == 'list') {
    if (!curUser) return message.reply('You must have premium to use this!')
    var prem = await client.pudb.getAll(message.author.id)
    if (!prem) {
      prem = { id: message.author.id, guilds: [] }
      await client.pudb.create(message.author.id, prem)
    }
    var gs = prem.guilds
    var msg = await message.reply('Loading...')
    var r = []
    if (gs.length > 0) {
      gs = (await client.shard.broadcastEval(`
                function getValues(c) {
                    return c.guilds.filter(x=>${JSON.stringify(gs)}.includes(x.id)).map(x=>{return {name: x.name, id: x.id}});
                }
                getValues(this);
            `)).filter(x => x.length > 0).forEach(_ => { _.forEach(a => { r.push(a.name) }) })
    } else r = ['None']
    return msg.edit('Current guilds: ' + r.makeReadable())
  }
}

exports.info = {
  name: 'premium',
  description: 'See how to get premium version of the bot',
  format: '{prefix}premium'
}
