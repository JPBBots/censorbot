const Request = require('../req')

const { internalPort } = require('../src/config')

/**
 * Worker internal methods for brokering master internals
 */
class WorkerInternals {
  /**
   * Worker Internals
   * @param {Worker} worker Worker
   */
  constructor (worker) {
    /**
     * Worker
     * @type {Worker}
     */
    this.worker = worker

    /**
     * Internal API
     * @type {Request}
     */
    this.api = Request(`http://localhost:${internalPort}`)
  }

  event (event, data, resolve) {
    let guild
    let shard
    switch (event) {
      case 'GUILD_FETCH':
        guild = this.worker.client.guilds.get(data.id)
        resolve(guild ? {
          i: guild.id,
          n: guild.name,
          a: guild.icon,
          c: this.worker.client.channels.filter(x => x.guild_id === data.id)
            .map(x => {
              return {
                id: x.id,
                name: x.name
              }
            }),
          r: guild.roles
            .map(x => {
              return {
                id: x.id,
                name: x.name
              }
            })
        } : {})
        break
      case 'RELOAD_INTERNALS':
        delete require.cache[require.resolve('./WorkerInternals')]
        const WorkerInternals = require('./WorkerInternals') // eslint-disable-line no-case-declarations
        this.worker.internal = new WorkerInternals(this.worker)
        break
      case 'RELOAD':
        this.worker.client.reloader.reload(data.part)
        break
      case 'GUILD_COUNT':
        resolve(this.worker.client.internals.formatted)
        break
      case 'EVAL':
        try {
          const client = this.worker.client // eslint-disable-line
          const results = eval(data.ev) // eslint-disable-line
          resolve({ results })
        } catch (err) {
          resolve({ results: 'Error: ' + err.message })
        }
        break
      case 'CLUSTER_STATS':
        resolve({
          cluster: {
            memory: process.memoryUsage().heapUsed,
            uptime: process.uptime()
          },
          shards: this.worker.client.shards.map(shard => {
            return {
              id: shard.id,
              ping: shard.ping,
              connected: shard.connected,
              guilds: this.worker.client.guilds.filter(x => this.worker.client.guildShard(x.id) === shard.id).size
            }
          })
        })
        break
      case 'RESTART':
        shard = this.worker.client.shards.get(data.id)
        if (!shard) return
        if (data.destroy) return this.worker.client.killShard(data.id)
        shard.restart()
        break
      case 'PRESENCE':
        this.worker.client.presence[data]()
        break
      default:
        break
    }
  }

  async fetchGuild (id) {
    const guild = await this.api
      .guilds[id]
      .get()

    if (!guild.i) return null

    return guild
  }

  async guildCount (counted) {
    const guilds = await this.api
      .guilds
      .get()

    return counted ? guilds.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0) : guilds
  }

  shardStats () {
    return this.api
      .shards
      .get()
  }

  eval (ev) {
    return this.api
      .clusters
      .post({
        body: { ev }
      })
  }

  reload (part) {
    this.api
      .reload[part]
      .post()
  }

  restart (id, destroy) {
    this.api
      .shards[id]
      .delete({
        query: destroy ? {
          d: true
        } : {}
      })
  }

  killCluster (id) {
    this.api
      .clusters[id]
      .delete()
  }

  reloadInternals () {
    this.api
      .reload
      .post()
  }

  setPresence (presence) {
    this.api
      .presence[presence]
      .put()
  }

  async createHelpMe (id, name, owner) {
    const res = await this.api
      .helpme
      .post({
        body: { id, name, owner }
      })

    if (res.error) return null

    return res.hm
  }

  getHelpMe (hm) {
    return this.api
      .helpme[hm]
      .get()
  }
}

module.exports = WorkerInternals
