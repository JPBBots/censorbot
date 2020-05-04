const Dashboard = require('../src/lib/services/Dashboard')
const WorkerInternals = require('./WorkerInternals')

class DashboardWorker {
  constructor (data, parent) {
    this.data = data
    this.parent = parent

    this.internals = new WorkerInternals(this)
    this.dash = new Dashboard(this)

    this.setup()
  }

  setup () {
    this.parent.on('message', (data) => {
      if (data.e === 'KILL') process.exit(1)
      if (data.e === 'SPAWN') this.spawn()
    })
  }

  spawn () {
    this.dash.spawn()
  }
}

module.exports = DashboardWorker
