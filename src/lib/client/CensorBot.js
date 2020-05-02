const config = require('../../config')

const Client = require('../../../lib/Client')
const Request = require('../../../req')

const CommandHandler = require('../bot/CommandHandler')
const EventHandler = require('../bot/EventHandler')
const DBL = require('../bot/DBL')
const PresenceManager = require('../bot/PresenceManager')

const Reloader = require('./Reloader')
const Internals = require('./Internals')
const UpdatesManager = require('./UpdatesManager')

const Filter = require('../services/Filter')
const Database = require('../services/Database')
const Dashboard = require('../services/Dashboard')
const Punishments = require('../services/Punishments')
const TicketManager = require('../services/TicketManager')
const BucketManager = require('../services/BucketManager')
const WebhookManager = require('../services/WebhookManager')

const Embed = require('../../../util/Embed')
const Collection = require('../../../util/Collection')

/**
 * Base censor bot client. Used as a hub for all other library structures
 * @extends Client
 */
class CensorBot extends Client {
  /**
   * Censor Bot Client
   * @param {Worker} cluster Cluster Worker
   * @param {Array.<Number>} shards Array of shard IDs to spawn
   * @param {Number} shardCount Shard Count
   */
  constructor (cluster, shards, shardCount) {
    super(config.token, cluster, { shards, shardCount })

    /**
     * Config
     * @type {Object}
     */
    this.config = config

    /**
     * Unavailable guilds
     * @type {Collection}
     */
    this.unavailables = new Collection()

    /**
     * Internal methods
     * @type {Internals}
     */
    this.internals = new Internals(this)

    /**
     * Multi-Lines
     * @type {Collection.<String, Object.<Snowflake, String>>}
     */
    this.multi = new Collection()

    /**
     * Help-ME ID's
     * @type {Collection.<SmallID, Snowflake>}
     */
    this.helpme = new Collection()

    /**
     * Whether in beta or not
     * @type {Boolean}
     */
    this.beta = true

    /**
     * Censor Bot API
     * @type {Request}
     */
    this.capi = Request('https://censor.bot', {}, { format: 'text' })

    this.start()
  }

  /**
   * Start bot
   */
  async start () {
    this.log(0, 2)
    const start = new Date().getTime()

    /**
     * Database
     * @type {Database}
     */
    this.db = new Database(this, this.config.db.username, this.config.db.password)
    await this.db.connect()

    /**
     * Dashboard
     * @type {Dashboard}
     */
    if (this.options.shards.includes(0)) this.dash = new Dashboard(this)
    /**
     * Command handler
     * @type {CommandHandler}
     */
    this.commands = new CommandHandler(this)
    /**
     * Event handler
     * @type {EventHandler}
     */
    this.events = new EventHandler(this)
    /**
     * Filter
     * @type {Filter}
     */
    this.filter = new Filter(this, '../../filter/linkbyp.json')
    /**
     * Punishment manager
     * @type {Punishments}
     */
    this.punishments = new Punishments(this)
    /**
     * Presence manager
     * @type {PresenceManager}
     */
    this.presence = new PresenceManager(this)
    /**
     * Buckets
     * @type {BucketManager}
     */
    this.buckets = new BucketManager(this)
    /**
     * Ticket Manager
     * @type {TicketManager}
     */
    this.tickets = new TicketManager(this)
    /**
     * Updates Manager
     * @type {UpdatesManager}
     */
    this.updates = new UpdatesManager(this)
    /**
     * Reloader
     * @type {Reloader}
     */
    this.reloader = new Reloader(this)
    /**
     * Webhook Manager
     * @type {WebhookManager}
     */
    this.webhooks = new WebhookManager(this)
    await this.webhooks.load()

    this.log(0, 3, `${new Date().getTime() - start}ms`)

    const botStart = new Date().getTime()

    await this.setup()

    this.log(1, 1, `${((new Date().getTime() - botStart) / 1000).toFixed(0)}s`)
    if (this.options.shards.includes(0)) await this.dash.spawn()
    if (this.cluster.id === this.config.clusters.length - 1) this.presence.set('d')
    /**
     * DBL Interface
     * @type {DBL}
     */
    if (this.cluster.id === this.config.clusters.length - 1) this.dbl = new DBL(this)

    this.log(7, 3, `${((new Date().getTime() - start) / 1000).toFixed(0)}s`)
  }

  /**
   * Check if user is admin
   * @param {Snowflake} id User
   */
  async isAdmin (id) {
    const response = await this.capi
      .admin[id]
      .get()

    return !!parseInt(response)
  }

  /**
   * Embed
   * @type {Embed}
   */
  get embed () {
    return new Embed()
      .color(0xf44646)
  }
}

module.exports = CensorBot
