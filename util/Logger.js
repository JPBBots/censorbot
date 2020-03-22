class Logger {
  constructor () {
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
      'PRESENCE'
    ]

    this.serviceLength = [...this.services].sort((a, b) => {
      if (a.length > b.length) return -1
      if (a.length < b.length) return 1
      return 0
    })[0].length + 2

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
      'LEFT'
    ]

    this.taskLength = [...this.tasks].sort((a, b) => {
      if (a.length > b.length) return -1
      if (a.length < b.length) return 1
      return 0
    })[0].length + 2

    const ipc = require('node-ipc')

    ipc.config.id = 'censor'
    ipc.config.logger = () => {}

    ipc.serveNet(()=>{})

    ipc.server.start()

    this.ipc = ipc
  }

  log (service, task, name = null, optional = null) {
    console.log(`${this.separate(this.services[service], this.serviceLength)}|${this.separate(this.tasks[task], this.taskLength)}${name !== null ? `| ${`${name}`.replace(/\n/g, ' [] ')}` : ''}${optional !== null ? ` (${optional})` : ''}`)
  }

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
