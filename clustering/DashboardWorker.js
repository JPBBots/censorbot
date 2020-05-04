const Dashboard = require('../src/lib/services/Dashboard')
const WorkerInternals = require('./WorkerInternals')

/**
 * Worker for managing database
 */
class DashboardWorker {
  /**
   * Dashboard Worker
   * @param {Object} data Worker Data
   * @param {ParentPort} parent Parent Port
   */
  constructor (data, parent) {
    this.data = data
    this.parent = parent

    this.internals = new WorkerInternals(this)
    this.dash = new Dashboard(this)

    this.setup()
  }

  /**
   * Sets parent interaction
   */
  setup () {
    this.parent.on('message', (data) => {
      if (data.e === 'KILL') process.exit(1)
      if (data.e === 'SPAWN') this.spawn()
    })
  }

  /**
   * Spawn dashboard
   */
  spawn () {
    this.dash.spawn()
  }
}

module.exports = DashboardWorker
