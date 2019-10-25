exports.run = (client, message, args) => {
  const fs = require('fs')
  const arg1 = args[0]
  const arg2 = args[1]
  var filt = client.serverFilters[message.guild.id]
  if (!filt) return message.reply('Invalid server')
  if (arg1 == '-r') {
    filt.reload()
    return message.reply(':ok_hand:').then(client.u.del(2000))
  }
  fs.writeFile(filt.filterFile, JSON.stringify(filt.addToBypass(arg1, arg2), null, 4), 'utf8', (err, dat) => {
    if (err) console.error(err)
    filt.reload()
    message.reply(`Added key ${arg2} to ${arg1}`).then(client.u.del(2000))
  })
}
exports.info = {
  name: 'fa',
  description: 'Adds bypass to filter',
  format: '{prefix}f [key] [bypass]'
}
