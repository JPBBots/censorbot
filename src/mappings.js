const { resolve } = require('path')
const d = __dirname

function r (dir = '') {
  return resolve(d, dir)
}

const commands = r('./commands')
const assets = r('../assets')
const filter = r('../filter')
const filterHandler = r('./filterHandler')

module.exports = {
  mappings: r('./mappings.js'),
  presences: r('./presences.js'),
  commands: {
    index: commands,
    admin: resolve(commands, './admin'),
    settings: resolve(commands, './settings'),
    normal: commands
  },
  assets: {
    index: assets,
    channels: resolve(assets, './channels.js'),
    db: resolve(assets, './db.js'),
    dbi: resolve(assets, './dbi.js'),
    guildDB: resolve(assets, './guildDB.js'),
    embeds: resolve(assets, './embeds.js'),
    webhooks: resolve(assets, './webhooks.js')
  },
  filter: {
    index: filter,
    class: resolve(filter, './class.js'),
    filter: resolve(filter, './filter.json'),
    linkbyp: resolve(filter, './linkbyp.json'),
    filterbackup: resolve(filter, './filterbackup.json')
  },
  filterHandler: {
    index: filterHandler,
    msg: resolve(filterHandler, './msg.js'),
    emsg: resolve(filterHandler, './emsg.js'),
    nick: resolve(filterHandler, './nick.js'),
    react: resolve(filterHandler, './react.js')
  },
  events: r('./events'),
  config: r('../config.js')
}
