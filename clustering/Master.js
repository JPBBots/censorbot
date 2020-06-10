const Collection = require('../util/Collection')
const Wait = require('../util/Wait')
const Timeout = new Wait(5000)
const Logger = require('../util/Logger')

const Cluster = require('./Cluster')
const ShardManager = require('./ShardManager')

const MasterAPI = require('./MasterAPI')

const { internalPort } = require('../src/config')

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
    this.internalClusters = require('../src/config').clusters

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
     * Shard Manager
     * @type {ShardManager}
     */
    this.sharder = new ShardManager(this)

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

    if (!inactive) this.clusters.set(id, cluster)

    return cluster
  }

  /**
   * Spawn workers
   */
  async spawnWorkers () {
    this.log('Spawning workers')

    this._createWorker('dash', 1)

    for (let i = 0; i < this.internalClusters.length; i++) {
      this._createWorker(i, 0, this.internalClusters[i])
    }

    await Promise.all(this.clusters.map(x => x.spawn()))

    await Timeout.wait()

    this.spawned = true

    this.log('All clusters spawned. Starting shards')

    this.sharder.spawn()
  }

  async restartCluster (id) {
    if (!isNaN(id)) id = Number(id)

    const currentCluster = this.clusters.get(id)
    if (!currentCluster) return

    currentCluster.dying = true
    currentCluster.send('KILL')

    this._createWorker(id, currentCluster.job, this.internalClusters[id])

    await Timeout.wait()
    return true
  }
}

module.exports = Master
