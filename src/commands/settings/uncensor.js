exports.run = async (client, message, args, db) => {
  const fs = require('fs')
  const Discord = require('discord.js')
  const arg1 = args[0]
  const arg2 = args[1]
  if (!arg1) {
    const o = new Discord.MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Uncensor Command:')
      .setDescription('+uncensor `add` : Add a custom word!\n+uncensor `remove` : Remove a custom word!\n+uncensor `clear` : Clears entire filter! (No warning, be careful)\n+uncensor `list` : List custom words for the server!')
      .setFooter('The uncensor command is used to add, remove, and see custom uncensor words to be added to the server!\nThis only affect your server! No one elses and cannot change the hard locked filter!')
    message.channel.send(o)
  }
  let filter = await db.get('uncensor')
  if (arg1 == 'add') {
    if (!arg2) {
      message.reply('Add a word to the uncensor list! Format: +uncensor add `word`')
    } else {
      const response = client.filter.test(message.content, true, filter)
      if (response.censor == false || response.method == 'server') {
        client.sendErr(message, 'Error, this word is not censored / is contained in your server filter!')
        return
      }
      if (filter.includes(arg2.toLowerCase())) {
        client.sendErr(message, "Error! This word is already in this servers uncensor list! If it still isn't uncensoring contact support (" + client.config.prefix + 'support)')
        return
      } else {
        if (arg2.toLowerCase().match(/[^a-zA-Z0-9 ]/gi)) return client.sendErr(message, 'Invalid string! Make sure not to include any special characters')
        var res = await client.sendSettings(message, ['Uncensor List', 'Added', arg2.toLowerCase()], ['Successfully added the word! Do +uncensor list to see your uncensor list!', 'Uncensor list edited by ' + message.author.username])
        if (res == 200) {
          filter.push(arg2.toLowerCase())
          const r = await db.set('uncensor', filter)
        } else return console.log('Error: ' + res)
      }
    }
  }
  if (arg1 == 'remove') {
    if (!arg2) {
      message.reply('Remove a word from the uncensor list! Format: +uncensor remove `word`')
    } else {
      if (!filter.includes(arg2.toLowerCase())) {
        client.sendErr(message, "Error! This word is not on this server's custom uncensor list! So therefore could not be removed.")
        return
      } else {
        var res = await client.sendSettings(message, ['Uncensor List', 'Removed', arg2.toLowerCase()], ['Successfully removed the word! Do +uncensor list to see your uncensor list!', 'Uncensor list edited by ' + message.author.username])
        if (res == 200) {
          filter[filter.indexOf(arg2.toLowerCase())] = undefined
          filter = filter.filter(x => x)
          const r = await db.set('uncensor', filter)
        } else return console.log('Error: ' + res)
      }
    }
  }
  if (arg1 == 'clear') {
    if (!filter[0]) {
      client.sendErr(message, 'Error! There are no words in the uncensor list to be cleared')
      return
    } else {
      var res = await client.sendSettings(message, ['Uncensor List', 'Cleared', `${filter.length} words -> 0 words`], ['Successfully removed all words from the uncensor list!', 'Uncensor list edited by ' + message.author.username])
      if (res == 200) {
        const r = await db.set('uncensor', [])
      } else return console.log('Error: ' + res)
    }
  }

  if (arg1 == 'list') {
    if (!filter[0]) {
      client.sendErr(message, 'Error! there are no words added to uncensor list!')
    } else {
      const o = new Discord.MessageEmbed()
        .setColor('DARK_GOLD')
        .setTitle('Current Filter:')
        .setDescription(filter.makeReadable())
        .setFooter('List Requested By: ' + message.author.username + " (Want message that doesn't self destruct? Do +uncensor list --)")
      if (!message.content.match(/--/)) {
        const me = await message.channel.send(o)
        setTimeout(() => {
          me.delete()
        }, 6000)
      } else {
        message.channel.send(o)
      }
    }
  }
}

exports.info = {
  name: 'uncensor',
  description: 'Uncensor certains words from the base filter for your server',
  format: '{prefix}uncensor'
}
