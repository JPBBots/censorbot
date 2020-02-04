module.exports = {
  adminLog: (content, author, argword) => {
    var {
      arg,
      word
    } = argword
    var embed = client.u.embed
      .setTitle(content)
      .addField('User', `${author}`)
      .addField('Match site + Swear Array Match', `${arg} + ${word}`)
    return embed
  },
  log: (content, message, method, type, err, obj) => {
    var tikme = ''
    var tikem = ''
    for (var i = 0; i < content.length; i++) {
      content[i] = content[i].replace(/\`\`\`/gi, '\\`\\`\\`')
      if (obj) {
        var cc = content[i].split(' ')
        for (var z = 0; z < cc.length; z++) {
          var s = false
          obj.arg.forEach(arg => {
            if (s) return
            if (cc[z].match(arg)) {
              cc[z] = `__${cc[z]}__`
              s = true
            }
          })
        }
        content[i] = cc.join(' ')
      }
    }
    if (method == 'base') {
      tikme = 'Mistake? Do +ticket'
      tikem = 'If you believe this was a mistake run +ticket'
    }
    if (method == 'server') {
      tikme = 'Custom server filter, (Contact server owner if mistake)'
      tikem = 'Custom Server Filter'
    }
    var convert = ['Deleted Message', 'Deleted Edited Message', 'Changed Innapropriate Nickname', 'Innapropriate Reaction']
    var embed = client.u.embed
      .setTitle(`${convert[type]}${err ? `\n\n${err}` : ''}`)
      .setColor(16452296)
      .setTimestamp(new Date())
      .setFooter(tikem, client.user.avatarURL())

    if (type !== 2) {
      embed.addField('User', `<@${message.author ? message.author.id : message.user_id}>`, true)
      embed.addField('Channel', `<#${message.channel ? message.channel.id : message.channel_id}>`, true)
    } else {
      // embed.setThumbnail(message.user.displayAvatarURL())
      embed.addField('User', `<@${message.user.id}>`)
    }

    if (type == 1) {
      embed.addField('After Edit', content, true)
    } else if (type == 2) {
      embed.addField('Nickname Content', content[0], true)
    } else if (type == 3) {
      embed.addField('Reaction Name', content[0], true)
      embed.addField('Reaction URL', `[Here](${content[1]})`, true)
    } else {
      embed.addField('Message', content[0])
    }
    return embed
  }
}
