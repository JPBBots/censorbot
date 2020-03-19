const config = require('../config')

const Client = require('../../lib/Client')
const Request = require('../../req')

const CommandHandler = require('./CommandHandler')
const EventHandler = require('./EventHandler')
const Filter = require('./Filter')
const Database = require('./Database')
const Dashboard = require('./Dashboard')
const Punishments = require('./Punishments')
const DBL = require('./DBL')
const PresenceManager = require('./PresenceManager')
const BucketManager = require('./BucketManager')
const WebhookManager = require('./WebhookManager')

const Embed = require('../../util/Embed')
const Collection = require('../../util/Collection')

class CensorBot extends Client {
  constructor () {
    super(config.token)
    this.config = config

    this.unavailables = new Collection()

    this.multi = new Collection()

    this.beta = false

    this.capi = Request('https://censorbot.jt3ch.net', {}, { format: 'text' })

    this.start()
  }

  async start () {
    this.log(0, 2)
    const start = new Date().getTime()
    this.db = new Database(this, this.config.db.username, this.config.db.password)
    await this.db.connect()
    this.dash = new Dashboard(this)
    this.commands = new CommandHandler(this)
    this.events = new EventHandler(this)
    this.filter = new Filter(this, '../filter/linkbyp.json')
    this.punishments = new Punishments(this)
    this.presence = new PresenceManager(this)
    this.buckets = new BucketManager(this)
    this.webhooks = new WebhookManager(this)
    await this.webhooks.load()

    this.log(0, 3, `${new Date().getTime() - start}ms`)

    const botStart = new Date().getTime()

    await this.setup()

    this.log(1, 1, `${((new Date().getTime() - botStart) / 1000).toFixed(0)}s`)
    await this.dash.spawn()
    this.presence.set('d')
    this.dbl = new DBL(this)

    this.log(7, 3, `${((new Date().getTime() - start) / 1000).toFixed(0)}s`)
  }

  async isAdmin (id) {
    const response = await this.capi
      .admin[id]
      .get()

    return !!parseInt(response)
  }

  get embed () {
    return new Embed()
      .color(0xf44646)
  }
}

module.exports = CensorBot
