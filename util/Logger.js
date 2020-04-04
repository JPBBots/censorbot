class Logger {
  /**
   * Logger
   */
  constructor () {
    /**
     * Services
     * @type {Array.<String>}
     */
    this.services = [
      'SERVICES',
      'DISCORD',
      'COMMANDS',
      'EVENTS',
      'API',
      'SHARD', // 5
      'BOT',
      'SYSTEM',
      'SHARDER',
      'SHARD WS',
      'WEBHOOKS', // 10
      'DBL',
      'PRESENCE',
      'TICKETS'
    ]

    this.serviceLength = [...this.services].sort((a, b) => {
      if (a.length > b.length) return -1
      if (a.length < b.length) return 1
      return 0
    })[0].length + 2

    /**
     * Tasks
     * @type {Array.<String>}
     */
    this.tasks = [
      'LOAD',
      'LOADED',
      'STARTING',
      'FINISHED',
      'RAN',
      'ROUTED', // 5
      'CONNECT',
      'CONNECTED',
      'READY',
      'OPEN',
      'CLOSED', // 10
      'RECONNECT',
      'SPAWNING',
      'CENSORED',
      'CONNECTION',
      'POST', // 15
      'POSTED',
      'SET',
      'JOINED',
      'LEFT',
      'SUBMITTED', // 20
      'APPROVED',
      'DENIED',
      'DESTROYED',
      'FAILED',
      'ERROR' // 25
    ]

    this.taskLength = [...this.tasks].sort((a, b) => {
      if (a.length > b.length) return -1
      if (a.length < b.length) return 1
      return 0
    })[0].length + 2

    const ipc = require('node-ipc')

    ipc.config.id = 'censor'
    ipc.config.logger = () => {}

    ipc.serveNet(() => {})

    ipc.server.start()

    this.ipc = ipc
  }

  /**
   * Log to console
   * @param {Integer} service Service
   * @param {Integer} task Task
   * @param {String} name Name
   * @param {String} optional Optional
   * @param {Boolean} error Whether error
   */
  log (service, task, name = null, optional = null, error = false) {
    const d = new Date()
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const seconds = d.getSeconds()
    const ms = d.getMilliseconds()
    console[error ? 'error' : 'log'](`${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}.${ms < 10 ? `00${ms}` : ms < 100 ? `0${ms}` : ms} |${this.separate(this.services[service], this.serviceLength)}|${this.separate(this.tasks[task], this.taskLength)}${name !== null ? `| ${`${name}`.replace(/\n/g, ' [] ')}` : ''}${optional !== null ? ` (${optional})` : ''}`)
  }

  /**
   * Make all lines even
   * @param {String} str String
   * @param {Integer} to What to seperate too
   */
  separate (str, to) {
    let res = str
    let sw = 1
    for (let i = 0; i < 100; i++) {
      if (sw === 1) res = res + ' '
      else res = ' ' + res

      if (res.length >= to) break

      sw = sw * -1
    }
    return res
  }
}

module.exports = Logger
