const Collection = require('../util/Collection')
const Wait = require('../util/Wait')
const Timeout = new Wait(5000)
const Logger = require('../util/Logger')

const Cluster = require('./Cluster')
const DashboardCluster = require('./DashboardCluster')

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
     * Logger
     * @type {Logger}
     */
    this.logger = new Logger('Master')

    this.log(14, 1, 'Spawning')

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

  _createWorker (id, shards, inactive) {
    const cluster = new Cluster(id, shards, this, inactive)

    if (!inactive) this.clusters.set(id, cluster)

    return cluster
  }

  /**
   * Spawn workers
   */
  async spawnWorkers () {
    const start = new Date().getTime()

    this.dash = new DashboardCluster(this)
    this.dash.spawn()

    for (let i = 0; i < this.internalClusters.length; i++) {
      this.log(14, 26, `Cluster ${i}`)
      await this._createWorker(i, this.internalClusters[i]).spawn()
    }

    await Timeout.wait()

    this.spawned = true

    this.log(14, 3, 'All Clusters', `${((new Date().getTime() - start) / 1000).toFixed(0)}s`)
  }

  async restartCluster (id) {
    id = parseInt(id)
    if (!id) return

    const cluster = this._createWorker(id, this.internalClusters[id], true)
    const currentCluster = this.clusters.get(id)

    await cluster.spawn()

    currentCluster.dying = true
    currentCluster.send('KILL')

    cluster.send('ACTIVATE')
    this.clusters.set(id, cluster)

    await Timeout.wait()
    return true
  }
}

module.exports = Master
