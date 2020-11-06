const Collection = require('../../util/Collection')
const Wait = require('../../util/Wait')
const Timeout = new Wait(5000)
const Logger = require('../../util/Logger')
const chunkShards = require('../../util/chunkShards')

const Cluster = require('./Cluster')
const ShardManager = require('./ShardManager')
const DBL = require('./DBL')
const PresenceManager = require('./PresenceManager')

const MasterAPI = require('./MasterAPI')

const RestManager = require('../../discord/rest/RestManager')

const { dbl, token, shardsPerCluster } = require('../../config')

/**
 * For controlling and starting clusters
 */
class Master {
  /**
   * Cluster Master
   */
  constructor () {
    /**
     * Holds all the worker threads
     * @type {Collection.<Number, Worker>}
     */
    this.clusters = new Collection()

    /**
     * Internal clusters
     * @type {?Array.<Array.<Number>>}
     */
    this.internalClusters = null

    /**
     * Internal Methods
     * @type {MasterAPI}
     */
    this.api = new MasterAPI(this)

    /**
     * Whether all clusters have been spawned
     * @type {Boolean}
     */
    this.spawned = false

    /**
     * Shard Manager
     * @type {ShardManager}
     */
    this.sharder = new ShardManager(this)

    /**
     * DBL
     * @type {DBL}
     */
    this.dbl = new DBL(this, dbl)

    /**
     * Presence Manager
     * @type {PresenceManager}
     */
    this.presence = new PresenceManager(this)

    /**
     * 30 minute interval for DBL and presence
     * @type {Timeout}
     */
    this.clock = setInterval(() => {
      this.presence.go()
      this.dbl.post()
    }, 1800000)

    /**
     * Logger
     * @type {Logger}
     */
    this.logger = new Logger('Master')

    /**
     * Discord Rest
     * @type {RestManager}
     */
    this.rest = new RestManager(token)

    this._gateway = null

    this.log('Cluster master has loaded')

    this.spawnWorkers()
  }

  get discord () {
    return this.rest.builder()
  }

  /**
   * Total number of shards
   * @type {Number}
   */
  get shardCount () {
    return this.internalClusters.reduce((a, b) => a + b.length, 0)
  }

  /**
   * Log
   * @param  {...any} _ Log
   */
  log (..._) {
    this.logger.log(..._)
  }

  _createWorker (id, job, shards, inactive) {
    const cluster = new Cluster(id, job, shards, this, inactive)

    if (!inactive) this.clusters.set(`${id}`, cluster)

    return cluster
  }

  /**
   * Spawn workers
   */
  async spawnWorkers () {
    const botGateway = await this
      .discord
      .gateway('bot')
      .get()

    if (!botGateway || !botGateway.shards) return console.log('Error contacting Discord gateway endpoint.')

    this.internalClusters = chunkShards(botGateway.shards, shardsPerCluster)

    this._gateway = botGateway.url

    this.log(`Spawning workers (${botGateway.shards} shards | ${botGateway.session_start_limit.remaining}/${botGateway.session_start_limit.total} identify's)`)

    this._createWorker('api', 1)
    this._createWorker('punishments', 2)

    for (let i = 0; i < this.internalClusters.length; i++) {
      this._createWorker(i, 0, this.internalClusters[i])
    }

    await Promise.all(this.clusters.map(x => x.spawn(this._gateway)))

    await Timeout.wait()

    this.log('All clusters spawned. Starting shards')

    await this.sharder.spawn()

    this.spawned = true

    this._createWorker('stats', 3)

    this.api.sendToAll('DONE')

    this.log('All shards spawned')
  }

  async restartCluster (id) {
    const currentCluster = this.clusters.get(`${id}`)
    if (!currentCluster) return false

    currentCluster.dying = true
    currentCluster.send('KILL')

    await this._createWorker(id, currentCluster.job, this.internalClusters[id])

    return true
  }
}

module.exports = Master
