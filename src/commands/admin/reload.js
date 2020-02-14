exports.run = async (client, message, args) => {
  let arg1 = args[0]
  const arg2 = args[1]
  if (arg1 == 'config') {
    client.shard.broadcastEval('this.reloadConfig()')
    message.delete()
    const oof = await message.reply('Config reloaded!')
    setTimeout(function () {
      oof.delete()
    }, 300)
    return
  }
  if (arg1 == 'filter') {
    client.reloadFilter()
    message.delete()
    const oof = await message.reply('Filter reloaded!')
    setTimeout(() => {
      oof.delete()
    }, 300)
  }
  if (arg1 == 'functions') {
    client.shard.broadcastEval('this.reloadFunctions()')
      .then(res => {
        message.reply(JSON.stringify(res))
      })
      .catch(err => {
        message.reply('Error: ' + err.message)
      })
    return
  }
  if (arg1 == 'utils') {
    client.shard.broadcastEval('this.reloadUtils()')
    return message.reply(':ok_hand:')
  }
  if (arg1 == 'dbi') {
    await client.shard.broadcastEval('delete require.cache[require.resolve(this.mappings.assets.dbi)]')
    arg1 = 'db'
  }
  if (arg1 == 'embeds') {
    await client.shard.broadcastEval(`
      delete require.cache[require.resolve(this.mappings.assets.embeds)]
      this.embeds = require(this.mappings.assets.embeds)
    `)
    return message.reply(":ok_hand:")
  }
  if (arg1 == 'db') {
    client.shard.broadcastEval('delete require.cache[require.resolve(this.mappings.assets.db)]; var db = require(this.mappings.assets.db); db.init().then(_=>db.applyToObject(this))')
    return message.reply(':ok_hand:')
  }
  if (arg1 == 'punishments') {
    client.shard.broadcastEval(`delete require.cache[require.resolve(this.mappings.assets.punishments)];
    const PunishmentsHandler = require(this.mappings.assets.punishments);
    this.punishments = new PunishmentsHandler(this, this.punishdb.db)`)
    
    message.reply(":ok_hand:")
  }
  if (arg1 == 'class') {
    client.shard.broadcastEval('this.reloadClass()')
    return message.reply(':ok_hand:')
  }
  if (arg1 == 'handler') {
    client.shard.broadcastEval(`delete require.cache[require.resolve(this.mappings.filterHandler["${arg2}"])];
        this.filterHandler["${arg2}"] = require(this.mappings.filterHandler["${arg2}"]);`)
    return message.reply(`Reloaded filterhandler: ${arg2}`)
  }
  if (arg1 == 'mappings') {
    client.shard.broadcastEval(`delete require.cache[require.resolve(this.mappings.mappings)];
        this.mappings = require(this.mappings.mappings);`)
    return message.reply(':ok_hand:')
  }
  if (arg1.startsWith('c:')) {
    const cmd = arg1.split(':')[1]
    var command = client.commands.get(cmd)
    if (!command) return message.reply('That command does not exist')
    var admin = command.info.admin == true
    var setting = command.info.setting == true
    var di = `${admin ? client.mappings.commands.admin : setting ? client.mappings.commands.settings : client.mappings.commands.normal}/${cmd}`.replace(/\\/gi, '/')
    client.shard.broadcastEval(`
        console.log(__dirname)
            delete require.cache[require.resolve('${di}')]
            this.commands.delete('${cmd}')
            const com = require('${di}')
            if(${admin}) com.info.admin = true;
            if(${setting}) com.info.setting = true;
            this.commands.set('${cmd}',com)
        `)
    message.reply(`Reloaded command: ${cmd}`)
    console.log(`${message.author.tag} reloaded command ${cmd.toUpperCase()}`.black.bgWhite)
  }
  if (arg1.startsWith('e:')) {
    const event = arg1.split(':')[1]
    client.shard.broadcastEval(`
            const path = require('path').resolve(this.mappings.events, "${event}" + '.js')
            delete require.cache[require.resolve(path)];

            this.events["${event}"] = require(path);
        `)
    message.reply('Reloaded event ' + event)
  }
}
exports.info = {
  name: 'reload',
  description: 'Used to reload specific parts',
  format: '{prefix}reload [part]'
}
