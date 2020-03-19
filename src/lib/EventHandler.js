const { readdirSync } = require('fs')
const dir = require('path').resolve.bind(undefined, __dirname)

class EventHandler {
  constructor (client) {
    client.log(0, 0, 'EventHandler')
    this.client = client

    this.events = {}
    this.eventsSet = false

    this.client.log(0, 1, 'EventHandler')

    this.load()
  }

  load () {
    this.client.log(3, 0, '/events')
    const events = readdirSync(dir('../events')).map(x => x.split('.')).filter(x => x[1] === 'js')
    if (!this.eventsSet) {
      events.forEach(e => {
        this.client.on(e[0], (...d) => {
          this.dispatch(e[0], ...d)
        })
      })
      this.eventsSet = true
    }
    events.forEach(e => {
      delete require.cache[require.resolve(dir('../events', e[0] + '.' + e[1]))]
      this.events[e[0]] = require(dir('../events', e[0] + '.' + e[1])).bind(this.client)
    })
    this.client.log(3, 1, `${events.length} events`)
  }

  dispatch (event, ...d) {
    if (!this.events[event]) return
    this.events[event](...d)
  }
}

module.exports = EventHandler
