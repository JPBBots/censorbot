const Request = require('../req')
const EventHandler = require('events')

const Shard = require('./Shard')
const Interface = require('./Interface')

const Collection = require('../util/Collection')
const Wait = require('../util/Wait')
const Logger = require('../util/Logger')
const Utils = require('../util/Utils')

class Client extends EventHandler {
  constructor (token, opts) {
    super()
    this.logger = new Logger()
    this.log(0, 0, 'Client')
    this.token = token

    this.utils = Utils

    this.interface = new Interface(this)

    this.ws = null
    this.shards = new Collection()

    this.ready = false

    this.user = null
    this.guilds = new Collection()
    this.channels = new Collection()
    this.roles = new Collection()
    this.userGuilds = new Collection()

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

  log (..._) { this.logger.log(..._) }

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

  async restartShard (id) {
    const shard = this.shards.get(id)
    if (shard) return shard.restart()
  }

  setupEvents () {
    this.on('GUILD_CREATE', (guild) => {
      guild.members.forEach(member => {
        this.addUserGuild(member.user.id, guild.id)
      })
      delete guild.members

      this.guilds.set(guild.id, guild)
      guild.channels.forEach(channel => {
        channel.guild_id = guild.id
        this.channels.set(channel.id, channel)
      })
    })
    this.on('GUILD_DELETE', (guild) => {
      if (guild.unavailable) return
      this.guilds.delete(guild.id)
      this.channels = this.channels.filter(x => x.guild_id !== guild.id)

      this.userGuilds
        .forEach((guilds, user) => {
          if (guilds.includes(guild.id)) this.removeUserGuild(user, guild.id)
        })
    })

    this.on('GUILD_MEMBER_ADD', (member) => {
      this.addUserGuild(member.user.id, member.guild_id)
    })
    this.on('GUILD_MEMBER_REMOVE', (event) => {
      this.removeUserGuild(event.user.id, event.guild_id)
    })

    this.on('CHANNEL_CREATE', (channel) => {
      this.channels.set(channel.id, channel)
    })
    this.on('CHANNEL_UPDATE', (channel) => {
      this.channels.set(channel.id, channel)
    })
    this.on('CHANNEL_DELETE', (channel) => {
      this.channels.delete(channel.id)
    })

    this.on('GUILD_ROLE_CREATE', (role) => {
      const guild = this.guilds.get(role.guild_id)
      if (!guild) return

      guild.roles.push(role.role)

      this.guilds.set(guild.id, guild)
    })
    this.on('GUILD_ROLE_UPDATE', (role) => {
      const guild = this.guilds.get(role.guild_id)

      guild.roles = guild.roles.filter(x => x.id !== role.role.id)
      guild.roles.push(role.role)

      this.guilds.set(guild.id, guild)
    })
    this.on('GUILD_ROLE_DELETE', (role) => {
      const guild = this.guilds.get(role.guild_id)

      guild.roles = guild.roles.filter(x => x.id !== role.role_id)

      this.guilds.set(guild.id, guild)
    })
  }

  get ping () {
    return this.shards.reduce((a, b) => a + b.ping, 0) / this.shards.size
  }

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

  addUserGuild(user, guild) {
    let guilds = this.userGuilds.get(user)

    if (!guilds) guilds = []

    if (guilds.includes(guild)) return

    guilds.push(guild)

    this.userGuilds.set(user, guilds)
  }

  removeUserGuild(user, guild) {
    let guilds = this.userGuilds.get(user)

    if (!guilds) return
    guilds = guilds.filter(x => x !== guild)

    if (guilds.length < 1) return this.userGuilds.delete(user)

    this.userGuilds.set(user, guilds)
  }
}

module.exports = Client
