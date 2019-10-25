exports.run = (client, message, args) => {
  const fs = require('fs')
  const arg1 = args[0]
  if (!arg1) {
    message.reply('no-config|corrupt-config')
    return
  }
  if (arg1 == 'no-config') {
    var res = []
    const u = fs.readdirSync('./data/server_data')
    client.guilds.array().forEach(g => {
      if (!u.includes(g.id + '.json')) {
        res.push(g.id)
      }
    })
    if (res.length < 1) {
      message.reply('All good!')
    } else {
      message.reply(res)
    }
  }
  if (arg1 == 'corrupt-config') {
    var res = []
    fs.readdirSync('./data/server_data').forEach(f => { if (!JSON.parse(fs.readFileSync('./data/server_data/' + f)).log || !JSON.parse(fs.readFileSync('./data/server_data/' + f)).role || !JSON.parse(fs.readFileSync('./data/server_data/' + f)).filter || JSON.parse(fs.readFileSync('./data/server_data/' + f)).role.length < 1 || JSON.parse(fs.readFileSync('./data/server_data/' + f)).log.length < 1) { res.push(f) } })
    if (res.length < 1) {
      message.reply('All good!')
    } else {
      message.reply(res)
    }
  }
}
exports.info = {
  name: 'debug',
  description: 'debug_module',
  format: '{prefix}debug [part]'
}
