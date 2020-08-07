/* eslint-disable no-case-declarations */

const { resolve } = require('path')
const lib = resolve(__dirname, '../')
const { MongoClient } = require('mongodb')

/**
 * Used for reloading parts
 */
class Reloader {
  /**
   * Reloader
   * @param {Client} client Client
   */
  constructor (client) {
    this.client = client
  }

  /**
   * Reload a service
   * @param {String} name Service Name
   */
  async reload (name) {
    let done = true
    switch (name) {
      case 'commands':
        this.client.commands.load()
        break
      case 'events':
        this.client.events.load()
        break
      case 'filter':
        delete require.cache[require.resolve(resolve(lib, './services/Filter.js'))]
        const Filter = require(resolve(lib, './services/Filter.js'))
        this.client.filter = new Filter()
        break
      case 'punish':
        delete require.cache[require.resolve(resolve(lib, './services/Punishments.js'))]
        const PunishmentHandler = require(resolve(lib, './services/Punishments.js'))
        this.client.punishments = new PunishmentHandler(this.client)
        break
      case 'log':
        delete require.cache[require.resolve('../../util/Logger.js')]
        const Logger = require('../../util/Logger')
        this.client.logger.ipc.server.stop()
        this.client.logger = new Logger()
        break
      case 'config':
        delete require.cache[require.resolve('../../config')]
        this.client.config = require('../../config')
        break
      case 'db':
        delete require.cache[require.resolve(resolve(lib, './services/Database'))]
        const Database = require(resolve(lib, './services/Database'))
        const mongo = new MongoClient(`mongodb://${this.client.config.db.username}:${this.client.config.db.password}@localhost:27017/`, { useNewUrlParser: true, useUnifiedTopology: true })
        await mongo.connect()
        const db = await mongo.db('censorbot')

        this.client.db.mongo.close(true, () => {
          this.client.db = new Database(this.client, this.client.config.db.username, this.client.config.db.password, db, mongo)
        })
        break
      case 'bucket':
        delete require.cache[require.resolve(resolve(lib, './services/BucketManager'))]
        const BucketManager = require(resolve(lib, './services/BucketManager'))
        this.client.buckets = new BucketManager(this.client)
        break
      case 'interface':
        delete require.cache[require.resolve(resolve(__dirname, '../../../lib/Interface'))]
        const Interface = require(resolve(__dirname, '../../../lib/Interface'))
        this.client.interface = new Interface(this.client)
        break
      case 'ch':
        delete require.cache[require.resolve(resolve(lib, './bot/CommandHandler'))]
        const CommandHandler = require(resolve(lib, './bot/CommandHandler'))
        this.client.commands = new CommandHandler(this.client)
        break
      case 'wh':
        delete require.cache[require.resolve(resolve(__dirname, '../../../lib/Webhook'))]
        delete require.cache[require.resolve(resolve(lib, './services/WebhookManager'))]
        const WebhookManager = require(resolve(lib, './services/WebhookManager'))
        const wh = new WebhookManager(this.client)
        await wh.load()
        this.client.webhooks = wh
        break
      case 'ticket':
        delete require.cache[require.resolve(resolve(lib, './services/TicketManager'))]
        const TicketManager = require(resolve(lib, './services/TicketManager'))
        this.client.tickets = new TicketManager(this.client)
        break
      case 'internals':
        delete require.cache[require.resolve(resolve(lib, './client/Internals'))]
        const Internals = require(resolve(lib, './client/Internals'))
        this.client.internals = new Internals(this.client)
        break
      case 'reloader':
        delete require.cache[require.resolve(resolve(lib, './client/Reloader'))]
        const Reloader = require(resolve(lib, './client/Reloader'))
        this.client.reloader = new Reloader(this.client)
        break
      default:
        done = false
        break
    }
    return done
  }
}

module.exports = Reloader
