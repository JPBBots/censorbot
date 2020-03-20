/* eslint-disable no-case-declarations */

const { resolve } = require('path')
const lib = resolve(__dirname, '../lib')
const { MongoClient } = require('mongodb')

exports.run = async function (message, args) {
  let done = true
  switch (args[0]) {
    case 'commands':
      this.client.commands.load()
      break
    case 'events':
      this.client.events.load()
      break
    case 'dash':
      this.client.dash.reload()
      break
    case 'filter':
      delete require.cache[require.resolve(resolve(lib, './Filter.js'))]
      const Filter = require(resolve(lib, './Filter.js'))
      this.client.filter = new Filter(this.client, '../filter/linkbyp.json')
      break
    case 'punish':
      delete require.cache[require.resolve(resolve(lib, './Punishments.js'))]
      const PunishmentHandler = require(resolve(lib, './Punishments.js'))
      this.client.punishments = new PunishmentHandler(this.client)
      break
    case 'log':
      delete require.cache[require.resolve('../../util/Logger.js')]
      const Logger = require('../../util/Logger')
      this.client.logger = new Logger()
      break
    case 'config':
      delete require.cache[require.resolve('../config')]
      this.client.config = require('../config')
      break
    case 'db':
      delete require.cache[require.resolve(resolve(lib, './Database'))]
      const Database = require(resolve(lib, './Database'))
      const mongo = new MongoClient(`mongodb://${this.client.config.db.username}:${this.client.config.db.password}@localhost:27017/`, { useNewUrlParser: true, useUnifiedTopology: true })
      await mongo.connect()
      const db = await mongo.db('censorbot')

      this.client.db.mongo.close(true, () => {
        this.client.db = new Database(this.client, this.client.config.db.username, this.client.config.db.password, db, mongo)
      })
      break
    case 'bucket':
      delete require.cache[require.resolve(resolve(lib, './BucketManager'))]
      const BucketManager = require(resolve(lib, './BucketManager'))
      this.client.buckets = new BucketManager(this.client)
      break
    case 'dbl':
      clearInterval(this.client.dbl.interval)
      delete require.cache[require.resolve(resolve(lib, './DBL'))]
      const DBL = require(resolve(lib, './DBL'))
      this.client.dbl = new DBL(this.client)
      break
    case 'presence':
      delete require.cache[require.resolve(resolve(lib, './PresenceManager'))]
      const PresenceManager = require(resolve(lib, './PresenceManager'))
      this.client.presence = new PresenceManager(this.client)
      break
    default:
      this.send('Invalid Part')
      done = false
      break
  }
  if (done) this.send(':ok_hand:')
}

exports.info = {
  name: 'reload',
  description: 'Reloads certain parts',
  format: '{prefix}reload [part]',
  aliases: ['r'],
  admin: true
}
