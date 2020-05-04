const { Worker } = require('worker_threads')

class DashboardCluster {
  constructor (master) {
    this.master = master

    this.id = 'dash'

    this.thread = null

    this.setup()
  }

  setup () {
    this.thread = new Worker('../clustering/dashboardService.js', { workerData: { id: this.id } })

    this.thread.on('message', (msg) => {
      this.emit(msg.e, msg.d, msg.i)
    })

    this.thread.on('exit', (code) => {
      this.master.log(14, 10, `Cluster ${this.id}`, code)

      if (!this.dying) this.setup()
    })

    if (this.master.spawned) this.spawn()
  }

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
