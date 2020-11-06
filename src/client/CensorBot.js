const config = require('../config')

const Client = require('../discord/Client')
const Request = require('../util/req')

const CommandHandler = require('../bot/CommandHandler')
const EventHandler = require('../bot/EventHandler')

const Reloader = require('./Reloader')
const Internals = require('./Internals')
const UpdatesManager = require('./UpdatesManager')

const Filter = require('../filter/Filter')
const Database = require('../services/Database')
const TicketManager = require('../services/TicketManager')
const BucketManager = require('../services/BucketManager')

const Embed = require('../discord/Embed')
const Collection = require('../util/Collection')

const { punishments: punishPort, stats: statsPort } = require('../ports')

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
     * Censor Bot API
     * @type {Request}
     */
    this.capi = Request('https://api.jt3ch.net', {}, { format: 'text' })

    this.punishments = Request(`http://localhost:${punishPort}`)

    this.stats = Request(`http://localhost:${statsPort}`)

    // this.start()
  }

  /**
   * Start bot
   * @param {String} gateway Discord Gateway URL
   */
  async start (gateway) {
    /**
     * Database
     * @type {Database}
     */
    this.db = new Database(this, this.config.db.username, this.config.db.password)
    await this.db.connect()

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
    this.filter = new Filter()
    /*
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

    this.log('Loaded. Registering shards')

    this.setup(gateway)
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
