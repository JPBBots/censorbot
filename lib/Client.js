const Request = require('../req')
const EventEmitter = require('events')
const { readdirSync } = require('fs')
const path = require('path')

const Shard = require('./Shard')
const Interface = require('./Interface')

const Collection = require('../util/Collection')
const Wait = require('../util/Wait')
const Logger = require('../util/Logger')
const Utils = require('../util/Utils')
const GuildShard = require('../util/GuildShard')

/**
 * @typedef {String} Snowflake Discord ID
 */

/**
  * Used for general interaction between backend and Discord
  * @extends EventEmitter
  */
class Client extends EventEmitter {
  /**
   * Discord Client
   * @param {String} token Discord Bot Token
   * @param {Object} opts Options
   * @param {Integer|Boolean} opts.shardCount Amount of shards to spawn
   * @param {String} opts.api URL of Discord API
   * @param {Integer} opts.spawnTimeout Time between shard spawns
   * @param {Object} opts.ws Websocket options
   * @param {String} opts.ws.url URL of Discord Websocket
   * @param {String} opts.ws.version Version of Discord Websocket to use
   * @param {String} opts.ws.encoding Encoding to use
   */
  constructor (token, opts) {
    super()
    /**
     * Logger
     * @type {Logger}
     */
    this.logger = new Logger()
    this.log(0, 0, 'Client')

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
     * @type {Collection.<Integer, Shard>}
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
     * @type {Collection.<Snowflake, Object>}
     */
    this.guilds = new Collection()

    /**
     * Channels
     * @type {Collection.<Snowflake, Object>}
     */
    this.channels = new Collection()

    this.roles = new Collection()

    /**
     * User guilds
     * @type {Collection.<Snowflake, Array.<Snowflake>>}
     */
    this.userGuilds = new Collection()

    /**
     * Options
     * @type {Object}
     * @property {Integer|Boolean} shardCount Amount of shards to spawn
     * @property {String} api URL of Discord API
     * @property {Integer} spawnTimeout Time between shard spawns
     * @property {Object} ws Websocket options
     * @property {String} ws.url URL of Discord Websocket
     * @property {String} ws.version Version of Discord Websocket to use
     * @property {String} ws.encoding Encoding to use
     */
    this.options = {
      shardCount: true, // true = recommended
      api: 'https://discordapp.com/api/v7',
      spawnTimeout: 6000,
      ws: {
        url: '',
        version: '6',
        encoding: 'json'
      },
      ...opts
    }

    this.log(0, 1, 'Client')
    // this.setup()
  }

  /**
   * Log to console
   * @param {Integer} service Service
   * @param {Integer} task Task
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

    this.log(1, 0, 'Gateway')
    const gateway = await this.api
      .gateway('bot')
      .get()

    this.log(1, 1, 'Gateway', `${gateway.url};${gateway.shards}`)

    this.options.ws.url = gateway.url
    this.session = gateway.session_start_limit
    if (this.options.shardCount === true) this.options.shardCount = gateway.shards

    this.spawnShards()
    this.setupEvents()

    return new Promise(resolve => {
      this.once('READY', () => resolve())
    })
  }

  /**
   * Spawns bot shards
   */
  async spawnShards () {
    const Timeout = new Wait(this.options.spawnTimeout)
    this.log(8, 12, `${this.options.shardCount} shards`)
    for (let i = 0; i < this.options.shardCount; i++) {
      const shard = new Shard(this, i)
      this.shards.set(i, shard)
      await shard.spawn()
      await Timeout.wait()
    }
    this.log(8, 1, undefined, `${this.user.username}#${this.user.discriminator}`)
    this.emit('READY', this.shards)
    this.ready = true
  }

  /**
   * Kill and resume a shard
   * @param {Integer} id Shard
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
        this.on(
          event.split('.')[0],
          require(`./events/${event}`).bind(this)
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

  addUserGuild (user, guild) {
    let guilds = this.userGuilds.get(user)

    if (!guilds) guilds = []

    if (guilds.includes(guild)) return

    guilds.push(guild)

    this.userGuilds.set(user, guilds)
  }

  removeUserGuild (user, guild) {
    let guilds = this.userGuilds.get(user)

    if (!guilds) return
    guilds = guilds.filter(x => x !== guild)

    if (guilds.length < 1) return this.userGuilds.delete(user)

    this.userGuilds.set(user, guilds)
  }

  /**
   * Gets shard ID of guild
   * @param {Snowflake} id Guild
   * @returns {Integer} Shard ID
   */
  guildShard (id) {
    return GuildShard(id, this.options.shardCount)
  }

  /**
   * Kills and starts up shard
   * @param {Integer} id Shard
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

    await newShard.spawn()
  }
}

module.exports = Client
