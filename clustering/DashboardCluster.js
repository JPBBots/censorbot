const resolve = require('path').resolve.bind(undefined, __dirname)

const { Worker } = require('worker_threads')

/**
 * Cluster manager for dashboard
 */
class DashboardCluster {
  /**
   * Dashboard Cluster
   * @param {Master} master Master
   */
  constructor (master) {
    /**
     * Master
     * @type {Master}
     */
    this.master = master

    /**
     * Cluster ID
     * @type {String}
     */
    this.id = 'dash'

    /**
     * Thread
     * @type {?Worker}
     */
    this.thread = null

    this.setup()
  }

  /**
   * Sets up worker thread
   */
  setup () {
    this.thread = new Worker(resolve('./dashboardService.js'), { workerData: { beta: process.argv.includes('-b'), id: this.id } })

    this.thread.on('message', (msg) => {
      this.emit(msg.e, msg.d, msg.i)
    })

    this.thread.on('exit', (code) => {
      this.master.log(14, 10, `Cluster ${this.id}`, code)

      if (!this.dying) this.setup()
    })

    if (this.master.spawned) this.spawn()
  }

  /**
   * Spawns dash
   */
  spawn () {
    this.send('SPAWN')
  }

  /**
   * Send a message to thread
   * @param {String} e Event
   * @param {Object} d Data
   * @param {?Number} i Expected response ID
   */
  send (e, d, i) {
    this.thread.postMessage({ e, d, i })
  }
}

module.exports = DashboardCluster
