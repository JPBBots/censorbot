const emojis = require('emoji-unicode-map')
exports.run = async (client, message, args, db) => {
  const fs = require('fs')
  const Discord = require('discord.js')
  const arg1 = args[0]
  let arg2 = args[1]
  const arg3 = args[2]
  const arg4 = args[3]
  const arg5 = args[4]
  if (!arg1) {
    message.channel.send(client.u.embed
      .setColor('RANDOM')
      .setTitle('Filter Command:')
      .setDescription('+filter `add` : Add a custom word!\n+filter `remove` : Remove a custom word!\n+filter `clear` : Clears entire filter! (No warning, be careful)\n+filter `list` : List custom words for the server!')
      .setFooter('The filter command is used to add, remove, and see custom censor words to be added to the server!\nThis only affect your server! No one elses and cannot change the hard locked filter!')
    )
  }
  let filter = await db.get('filter')
  if (arg1 == 'add') {
    if (!arg2) {
      message.reply('Add a word to the filter! Format: +filter add `word`')
    } else {
      const response = client.filter.test(message.content, true, filter)
      if (response.censor != false && response.method == 'base') {
        client.sendErr(message, 'Error, this word is already contained in the base filter! There is no need to add it!')
        return
      }
      var emo = emojis.get(arg2)
      if (emo) {
        arg2 = emo
        if (arg2.includes('_')) arg2 = arg2.split('_')[0]
      }
      if (arg2.match(/<:.+:[0-9]+>/gi)) {
        arg2 = arg2.split(':')[1]
      }
      if (filter.includes(arg2.toLowerCase())) {
        client.sendErr(message, "Error! This word is already in this servers filter! If it still isn't censoring contact support (" + client.config.prefix + 'support)')
        return
      } else {
        if (arg2.toLowerCase().match(/[^a-zA-Z0-9 ]/gi)) return client.sendErr(message, 'Invalid string! Make sure not to include any special characters')
        var res = await client.sendSettings(message, ['Filter', 'Added', arg2.toLowerCase()], ['Successfully added the word! Do +filter list to see your filter!', 'Filter edited by ' + message.author.username])
        if (res == 200) {
          filter.push(arg2.toLowerCase())
          db.set('filter', filter)
        } else return console.log('Error: ' + res)
      }
    }
  }
  if (arg1 == 'remove') {
    if (!arg2) {
      message.reply('Remove a word from the filter! Format: +filter remove `word`')
    } else {
      if (!filter.includes(arg2.toLowerCase())) {
        client.sendErr(message, "Error! This word is not on this server's custom filter! So therefore could not be removed.")
        return
      } else {
        var res = await client.sendSettings(message, ['Filter', 'Removed', arg2.toLowerCase()], ['Successfully removed the word! Do +filter list to see your filter!', 'Filter edited by ' + message.author.username])
        if (res == 200) {
          filter[filter.indexOf(arg2.toLowerCase())] = undefined
          filter = filter.filter(x => x)
          db.set('filter', filter)
        } else return console.log('Error: ' + res)
      }
    }
  }
  if (arg1 == 'clear') {
    if (!filter[0]) {
      client.sendErr(message, 'Error! There are no words in the filter to be cleared')
      return
    } else {
      var res = await client.sendSettings(message, ['Filter', 'Cleared', `${filter.length} words -> 0 words`], ['Successfully removed all words from the filter!', 'Filter edited by ' + message.author.username])
      if (res == 200) {
        db.set('filter', [])
      } else return console.log('Error: ' + res)
    }
  }

  if (arg1 == 'list') {
    if (!filter[0]) {
      client.sendErr(message, 'Error! there are no words added to the filter!')
    } else {
      const o = new Discord.MessageEmbed()
        .setColor('DARK_GOLD')
        .setTitle('Current Filter:')
        .setDescription(filter.makeReadable())
        .setFooter('List Requested By: ' + message.author.username + " (Want message that doesn't self destruct? Do +filter list --)")
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
  name: 'filter',
  description: 'Custom filter settings for the server',
  format: '{prefix}filter'
}
