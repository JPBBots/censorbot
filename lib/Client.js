const Request = require('../req')
const EventEmitter = require('events')
const { readdirSync } = require('fs')
const path = require('path')

const Shard = require('./Shard')
const Interface = require('./Interface')

const Collection = require('../util/Collection')
const Logger = require('../util/Logger')
const Utils = require('../util/Utils')
const GuildShard = require('../util/GuildShard')

/**
 * @typedef {String} Snowflake Discord ID
 */

/**
 * Options used in client creation
 * @typedef {Object} ClientOptions
 * @property {Array.<Number>} shards=[0] Shards to spawn
 * @property {Number} shardCount=0 Shard Amount
 * @property {String} api='https://discord.com/api/v7' URL of Discord API
 * @property {Number} spawnTimeout=6000 Time between shard spawns
 * @property {Object} ws Websocket options
 * @property {String} ws.url='' URL of Discord Websocket
 * @property {String} ws.version='6' Version of Discord Websocket to use
 * @property {String} ws.encoding='json' Encoding to use
 */

/**
  * Used for general interaction between backend and Discord
  * @extends EventEmitter
  */
class Client extends EventEmitter {
  /**
   * Discord Client
   * @param {String} token Discord Bot Token
   * @param {Worker} cluster Cluster Worker
   * @param {ClientOptions} opts Options
   */
  constructor (token, cluster, opts) {
    super()

    /**
     * Cluster Worker
     * @type {Cluster}
     */
    this.cluster = cluster

    /**
     * Logger
     * @type {Logger}
     */
    this.logger = new Logger(`Cluster ${this.cluster.id}`)

    /**
     * Discord Bot Token
     * @type {String}
     */
    this.token = token

    /**
     * Utilities
     * @type {Object}
     */
    this.utils = Utils

    /**
     * Discord API interface
     * @type {Interface}
     */
    this.interface = new Interface(this)

    /**
     * Shards
     * @type {Collection.<Number, Shard>}
     */
    this.shards = new Collection()

    /**
     * Whether bot is ready
     * @type {Boolean}
     */
    this.ready = false

    /**
     * Client User
     * @type {?Object}
     */
    this.user = null

    /**
     * Guilds
     * @type {Collection.<Snowflake, object>}
     */
    this.guilds = new Collection()

    /**
     * Channels
     * @type {Collection.<Snowflake, object>}
     */
    this.channels = new Collection()

    /**
     * User dm channels
     * @type {Collection.<Snowflake, Snowflake>}
     */
    this.userChannels = new Collection()

    /**
     * Internal event handling
     * @type {Object.<String, Function>}
     */
    this.internalEvents = {}

    /**
     * Options
     * @type {ClientOptions}
     */
    this.options = {
      shards: opts.shards || [0],
      shardCount: opts.shardCount || 1,
      api: 'https://discord.com/api/v7',
      spawnTimeout: 6000,
      ws: {
        url: '',
        version: '6',
        encoding: 'json'
      },
      ...opts
    }
  }

  get done () {
    return this.ready && !this.shards.some(x => !x.connected)
  }

  /**
   * Log to console
   * @param {Number} service Service
   * @param {Number} task Task
   * @param {String} name Name of log
   * @param {String} optional Extra log
   * @param {Boolean} error Whether it's an error or not
   */
  log (..._) { this.logger.log(..._) }

  /**
   * Sets up bot
   */
  async setup () {
    this.api = Request(this.options.api, { Authorization: `Bot ${this.token}` })
    const gateway = await this.api
      .gateway('bot')
      .get()

    this.options.ws.url = gateway.url
    this.session = gateway.session_start_limit

    this.setMaxListeners(50)

    this.setupEvents()
    this.spawnShards()

    return new Promise(resolve => {
      this.once('READY', () => resolve())
    })
  }

  /**
   * Spawns bot shards
   */
  async spawnShards () {
    for (let i = 0; i < this.options.shards.length; i++) {
      const shard = new Shard(this, this.options.shards[i])
      this.shards.set(this.options.shards[i], shard)

      this.cluster.internal.registerShard(shard.id)
    }

    this.emit('REGISTERED')

    await Promise.all(this.shards.map(x => x.promise))

    this.ready = true
    this.emit('READY', this.shards)
  }

  /**
   * Kill and resume a shard
   * @param {Number} id Shard
   */
  async restartShard (id) {
    const shard = this.shards.get(id)
    if (shard) return shard.restart()
  }

  /**
   * Setup bot events
   */
  setupEvents () {
    readdirSync(path.resolve(__dirname, './events'))
      .forEach(event => {
        this.internalEvents[event.split('.')[0]] = require(`./events/${event}`).bind(this)
        this.on(
          event.split('.')[0],
          (...d) => this.internalEvents[event.split('.')[0]](...d)
        )
      })
  }

  /**
   * Bot overall ping across all shards
   */
  get ping () {
    return this.shards.reduce((a, b) => a + b.ping, 0) / this.shards.size
  }

  /**
   * Sets bot status
   * @param {String} type Presence Type
   * @param {String} name Game name
   * @param {String} status Status
   * @param {?String} stream Stream URL
   */
  setStatus (type, name, status = 'online', stream) {
    this.shards.forEach(shard => {
      shard.setStatus({
        afk: false,
        status,
        since: 0,
        game: {
          type: this.utils.presenceTypes[type.toLowerCase()],
          name: name,
          url: stream
        }
      })
    })
  }

  /**
   * Gets shard ID of guild
   * @param {Snowflake} id Guild
   * @returns {Number} Shard ID
   */
  guildShard (id) {
    return GuildShard(id, this.options.shardCount)
  }

  /**
   * Kills and starts up shard
   * @param {Number} id Shard
   * @returns {Promise} Promise
   */
  async killShard (id) {
    id = parseInt(id)
    const shard = this.shards.get(id)
    if (!shard) throw new Error('Invalid Shard')
    shard.destroy()
    this.guilds = this.guilds.filter(x => this.guildShard(x.id) !== id)

    const newShard = new Shard(this, id)
    this.shards.set(id, newShard)

    this.cluster.internal.registerShard(newShard.id)
  }
}

module.exports = Client
