const Collection = require('../../../../util/Collection')
const Wait = require('../../../../util/Wait')
const Timeout = new Wait(5000)
const Logger = require('../../../../util/Logger')

const Cluster = require('./Cluster')
const ShardManager = require('./ShardManager')
const DBL = require('./DBL')
const PresenceManager = require('./PresenceManager')

const MasterAPI = require('./MasterAPI')

const { internalPort, clusters, dbl } = require('../../../config')

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
     * @type {Array.<Array.<Number>>}
     */
    this.internalClusters = clusters

    /**
     * Internal Methods
     * @type {MasterAPI}
     */
    this.api = new MasterAPI(this, internalPort)

    /**
     * Whether all clusters have been spawned
     * @type {Boolean}
     */
    this.spawned = false

    /**
     * Whether in beta mode
     * @type {Boolean}
     */
    this.beta = process.argv.includes('-b')

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

    this.log('Cluster master has loaded')

    this.spawnWorkers()
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
    this.log('Spawning workers')

    this._createWorker('api', 1)

    for (let i = 0; i < this.internalClusters.length; i++) {
      this._createWorker(i, 0, this.internalClusters[i])
    }

    await Promise.all(this.clusters.map(x => x.spawn()))

    await Timeout.wait()

    this.log('All clusters spawned. Starting shards')

    await this.sharder.spawn()

    this.spawned = true

    this.log('All shards spawned')
  }

  async restartCluster (id) {
    const currentCluster = this.clusters.get(`${id}`)
    if (!currentCluster) return false

    currentCluster.dying = true
    currentCluster.send('KILL')

    await this._createWorker(id, currentCluster.job, this.internalClusters[id]).spawn()

    return true
  }
}

module.exports = Master
