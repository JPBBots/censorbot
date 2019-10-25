exports.run = async (client, message, args) => {
  const arg1 = args[0]
  if (!arg1) {
    message.reply('+db clear <ent> | +db set <ent> <plc> <val> | +db remove <ent> | +db get <ent>')
    return
  }
  if (args[1] == '.') args[1] = message.guild.id
  if (arg1 == 'clear') {
    client.rdb.update(args[1], new client.config.serverConfig(args[1]))
    message.reply(':ok_hand:')
  }
  if (arg1 == 'create') {
    client.rdb.create(args[1], client.config.serverConfig(args[1]))
    message.reply(':ok_hand:')
  }
  if (arg1 == 'set') {
    const k = await message.channel.send(new client.discord.MessageEmbed({ title: 'Setting. Please wait...' }))
    let val
    try {
      val = JSON.parse(args[3].replace(/\'/g, '"'))
    } catch (e) {
      val = args[3]
    }
    const r = await client.rdb.set(args[1], args[2], val)
    if (r.unchanged > 0) {
      k.edit(new client.discord.MessageEmbed({ title: 'Already equals value' }))
    } else if (r.replaced > 0) {
      k.edit(new client.discord.MessageEmbed({ title: ':ok_hand:', description: `Replaced ${r.replaced} values. (${args[2]} => \`${args[3]}\`)`, footer: { text: `Took ${(((k.createdAt - new Date()) * -1) / 1024).toFixed(2)} seconds` } }))
    } else {
      k.edit(new client.discord.MessageEmbed({ title: 'Error!' }))
    }
  }
  if (arg1 == 'remove') {
    const r = client.rdb.delete(args[1])
    return message.reply('removed ' + args[1])
  }
  if (arg1 == 'get') {
    const u = await client.rdb.getAll(args[1])
    const k = Object.keys(u)
    const re = new client.discord.MessageEmbed()
    for (var i = 0; i < k.length; i++) {
      if (u[k[i]] === '') {
        u[k[i]] = '(no value)'
      }
      var rko = ''
      if (u[k[i]] instanceof Array) rko = 'array'
      else rko = typeof u[k[i]]
      if (k[i] == 'censor') u[k[i]] = JSON.stringify(u[k[i]])
      re.addField(k[i], u[k[i]] + `(${rko})`, true)
    }
    re.setColor('RANDOM')
    message.reply(re)
  }
  if (arg1 == 'file') {
    const u = await client.rdb.getAll(args[1])
    if (!u) return message.reply('No entry found')
    const fs = require('fs')
    fs.writeFileSync('./data/temp/' + args[1] + '.json', JSON.stringify(u))
    message.channel.send('File for ' + args[1], {
      files: [{
        attachment: require('path').resolve(__dirname, '../../' + 'data/temp/', `${args[1]}.json`),
        name: args[1] + '.json'
      }]
    }).then(a => {
      fs.unlinkSync('./data/temp/' + args[1] + '.json')
    })
  }
  if (arg1 == 'raw') {
    const u = await client.rdb.getAll(args[1])
    if (!u) return message.reply('No entry found')
    message.channel.send(new client.discord.MessageEmbed({ title: 'Raw Data', description: `\`\`\`json\n${JSON.stringify(u, null, 2)}\`\`\``, footer: { text: '................................................................................................................................................................' } }))
  }
}
exports.info = {
  name: 'db',
  description: 'Used to interact and retrieve database entries',
  format: '{prefix}db',
  aliases: ['database']
}
