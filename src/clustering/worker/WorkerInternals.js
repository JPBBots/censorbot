const Request = require('../../util/req')

const { master: masterPort } = require('../../ports')

const Collection = require('../../util/Collection')

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
     * Guild fetch cache
     * @type {Collection.<Snowflake, CachedGuild>}
     */
    this.guildCache = new Collection()

    /**
     * Internal API
     * @type {Request}
     */
    this.api = Request(`http://localhost:${masterPort}`)
  }

  async event (event, data, resolve) {
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
          let results = eval(data.ev) // eslint-disable-line
          if (results && results.then) results = await results
          resolve(results)
        } catch (err) {
          resolve('Error: ' + err.message)
        }
        break
      case 'CLUSTER_STATS':
        resolve({
          cluster: {
            memory: process.memoryUsage().heapUsed,
            uptime: process.uptime(),
            id: this.worker.id
          },
          shards: this.worker.client.shards.map(shard => {
            return {
              id: shard.id,
              ping: shard.ping,
              state: shard.registering ? 1 : shard.connected ? 2 : !shard.ws.connected && shard.ws.opened ? 1 : 0,
              connected: shard.connected,
              guilds: this.worker.client.guilds.filter(x => this.worker.client.guildShard(x.id) === shard.id).size
            }
          })
        })
        break
      case 'RESTART':
        shard = this.worker.client.shards.get(data.id)
        if (!shard) return
        shard.ws.emit('RESTARTING')
        if (data.destroy) {
          shard.setStatus({
            afk: false,
            status: 'dnd',
            since: 0,
            game: {
              type: 0,
              name: 'Restarting...'
            }
          })
          return this.worker.client.killShard(data.id)
        }
        shard.restart()
        break
      case 'PRESENCE':
        this.worker.client.setStatus(...data)
        break
      case 'ACTIVATE':
        this.worker.inactive = false
        break
      case 'SPAWN_SHARD':
        shard = this.worker.client.shards.get(data.id)
        shard.registering = false
        shard.spawn()

        shard.ws.once('READY', () => {
          resolve()
        })
        shard.ws.once('RESTARTING', () => {
          resolve()
        })
        break
      case 'INFO':
        resolve({
          id: this.worker.id,
          usage: process.memoryUsage().heapUsed
        })
        break
      default:
        break
    }
  }

  /**
   * Fetch a guild
   * @param {Snowflake} id Guild ID
   * @return {CachedGuild} Guild
   */
  async fetchGuild (id) {
    const current = this.guildCache.get(id)
    if (current) return current

    const guild = await this.api
      .guilds[id]
      .get()

    if (!guild.i) return null

    this.guildCache.set(id, guild)

    setTimeout(() => {
      this.guildCache.delete(id)
    }, 120000)

    return guild
  }

  /**
   * Register a shard for spawning
   * @param {Number} shard Shard ID
   */
  registerShard (shard) {
    this.worker.client.log(`Shard ${shard} registered`)
    this.api
      .shards[shard]
      .post()
  }

  /**
   * Gets guild count
   * @param {Boolean} counted Whether to be a total of numbers
   * @returns {Array.<Array.<Number>>|Number}
   */
  async guildCount (counted) {
    const guilds = await this.api
      .guilds
      .get()

    return counted ? guilds.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0) : guilds
  }

  /**
   * Cluster stats object
   * @typedef {Object} ClusterStats
   * @property {Object} cluster Cluster info
   * @property {Number} cluster.uptime Cluster uptime
   * @property {Number} cluster.memory Cluster memory usage
   * @property {Array.<ShardStats>} shards Array of shard info
   */

  /**
   * Shard stats object
   * @typedef {Object} ShardStats
   * @property {Number} id Shard ID
   * @property {Boolean} connected Whether the shard is connected
   * @property {Number} ping Shard WS ping
   * @property {Number} guilds Guilds on shard
   */

  /**
   * Shard stats
   * @returns {Array.<ClusterStats>}
   */
  shardStats () {
    return this.api
      .shards
      .get()
  }

  /**
   * Evaluated code on all shards
   * @param {String} ev String to evaluate
   * @returns {Array.<String>} Array of responses in order of cluster
   */
  eval (ev) {
    return this.api
      .clusters
      .post({
        body: { ev }
      })
  }

  /**
   * Evaluate code on the master process
   * @param {String} ev String to evaluate
   * @returns {*} Response
   */
  masterEval (ev) {
    return this.api
      .eval
      .post({
        body: { ev }
      })
      .then(x => x.result)
  }

  /**
   * Reloads a part on all clusters
   * @param {String} part Reloadable part
   */
  reload (part) {
    this.api
      .reload[part]
      .post()
  }

  /**
   * Restart a shard
   * @param {Number} id Shard ID
   * @param {Boolean} destroy Whether to kill
   */
  restart (id, destroy) {
    this.api
      .shards[id]
      .delete({
        query: destroy ? {
          d: true
        } : {}
      })
  }

  info () {
    return this.api
      .info
      .get()
  }

  /**
   * Kill and restart an entire cluster
   * @param {Number} id Cluster ID
   */
  killCluster (id) {
    return this.api
      .clusters[id]
      .delete()
  }

  /**
   * Reload cluster internal components
   */
  reloadInternals () {
    this.api
      .reload
      .post()
  }

  restartDashboard () {
    this.api
      .dash
      .delete()
  }

  /**
   * Sets a presence on all shards
   * @param {?String} presence Presence name
   */
  setPresence (presence) {
    if (!presence) return this.api.presence.post()
    this.api
      .presence[presence]
      .put()
  }

  /**
   * Creates a HelpME package
   * @param {Snowflake} id Guild ID
   * @param {String} name Guild Name
   * @param {Snowflake} owner Owner ID
   * @returns {SmallID}
   */
  async createHelpMe (id, name, owner) {
    const res = await this.api
      .helpme
      .post({
        body: { id, name, owner }
      })

    if (res.error) return null

    return res.hm
  }

  /**
   * Retrieves a packaged HelpME package
   * @param {SmallID} hm HelpME code
   */
  getHelpMe (hm) {
    return this.api
      .helpme[hm]
      .get()
  }
}

module.exports = WorkerInternals
