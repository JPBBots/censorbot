const Websocket = require('./Websocket')
const { OPEN } = require('ws')

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
    client.log(5, 0, id)
    this.client = client
    this.id = id

    this.ws = null
    this.ping = null

    this.dying = false

    this.unavailables = new Map()

    this.onReady = null

    this.client.log(5, 1, id)
  }

  /**
   * Spawns shard
   */
  spawn () {
    this.client.log(9, 6, this.id)
    return new Promise(resolve => {
      this.onReady = resolve

      this.ws = new Websocket(this)
      this.setup()
    })
  }

  /**
   * Whether or not the shard is connected
   */
  get connected () {
    return this.ws.ws.readyState === OPEN
  }

  /**
   * Setup shard
   */
  setup () {
    this.ws.on('READY', (data) => {
      this.client.log(9, 7, this.id)
      if (data.guilds.length < 1) {
        this.client.emit('SHARD_READY', this)
        this.unavailables = null
        this.onReady()
        this.client.log(5, 8, this.id)
      }
      data.guilds.forEach(g => { this.unavailables.set(g.id, 1) })
      if (!this.client.user) this.client.user = data.user
    })
    this.ws.on('GUILD_CREATE', (guild) => {
      if (this.unavailables && this.unavailables.has(guild.id)) {
        this.unavailables.delete(guild.id)
        guild.members.forEach(member => {
          this.client.addUserGuild(member.user.id, guild.id)
        })
        delete guild.members

        this.client.guilds.set(guild.id, guild)
        guild.channels.forEach(channel => {
          channel.guild_id = guild.id
          this.client.channels.set(channel.id, channel)
        })
        if (this.unavailables.size === 0) {
          this.client.emit('SHARD_READY', this)
          this.unavailables = null
          this.onReady()
          this.client.log(5, 8, this.id)
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
          this.client.log(5, 8, this.id)
        }
      }
    })
  }

  /**
   * Sets bot status
   * @param {Object} d Data packet
   */
  setStatus (d) {
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

    this.client.log(9, 23, this.id)
  }
}

module.exports = Shard
