const Websocket = require('./Websocket')

/**
 * Used for connecting and managing separate shards on the Discord bot
 */
class Shard {
  /**
   * Shard interface
   * @param {Client} client Client
   * @param {Number} id Shard ID
   */
  constructor (client, id) {
    this.client = client
    this.id = id

    this.ws = null
    this.ping = null
    this.onReady = null

    this.dying = false

    this.unavailables = new Map()

    this.ws = new Websocket(this)

    this.promise = new Promise((resolve) => {
      this.onReady = resolve
    })

    this.promise.then(_ => {
      this.client.log(`Shard ${this.id} cache settled and ready`)
    })
  }

  /**
   * Spawns shard
   */
  spawn () {
    this.setup()
    this.ws.setup()
  }

  /**
   * Whether or not the shard is connected
   */
  get connected () {
    return this.ws.opened && this.ws.connected
  }

  /**
   * Setup shard
   */
  setup () {
    this.ws.on('READY', (data) => {
      if (data.guilds.length < 1) {
        this.client.emit('SHARD_READY', this)
        this.unavailables = null
        this.onReady()
      }
      data.guilds.forEach(g => { this.unavailables.set(g.id, 1) })
      if (!this.client.user) this.client.user = data.user
    })
    this.ws.on('GUILD_CREATE', (guild) => {
      if (this.unavailables && this.unavailables.has(guild.id)) {
        this.unavailables.delete(guild.id)

        this.client.internalEvents.GUILD_CREATE(guild)
        if (this.unavailables.size === 0) {
          this.client.emit('SHARD_READY', this)
          this.unavailables = null
          this.onReady()
        }
      } else this.client.emit('GUILD_CREATE', guild)
    })
    this.client.on('GUILD_DELETE', (guild) => {
      if (this.unavailables && this.unavailables.has(guild.id)) {
        this.unavailables.delete(guild.id)
        if (this.unavailables.size === 0) {
          this.client.emit('SHARD_READY', this)
          this.unavailables = null
          this.onReady()
        }
      }
    })
  }

  /**
   * Sets bot status
   * @param {Object} d Data packet
   */
  setStatus (d) {
    if (!this.connected) return
    this.ws.sendRaw({
      op: 3,
      d
    })
  }

  /**
   * Restarts shard
   */
  restart () {
    this.ws.kill()
  }

  /**
   * Destroys shard
   */
  destroy () {
    this.dying = true
    this.ws.kill()
  }
}

module.exports = Shard
