const { readdirSync } = require('fs')
const dir = require('path').resolve.bind(undefined, __dirname)

/**
 * Used for handling preset events from the Discord websocket
 */
class EventHandler {
  /**
   * Event Handler
   * @param {Client} client Client
   */
  constructor (client) {
    client.log(0, 0, 'EventHandler')
    /**
     * Client
     * @type {Client}
     */
    this.client = client

    /**
     * Events
     * @type {Object.<String, Function>}
     */
    this.events = {}

    /**
     * Whether or not the events are attached to the event handler
     * @type {Boolean}
     */
    this.eventsSet = false

    this.client.log(0, 1, 'EventHandler')

    this.load()
  }

  /**
   * (Re)loads events
   */
  load () {
    this.client.log(3, 0, '/events')
    const events = readdirSync(dir('../../events')).map(x => x.split('.')).filter(x => x[1] === 'js')
    if (!this.eventsSet) {
      events.forEach(e => {
        this.client.on(e[0], (...d) => {
          this.dispatch(e[0], ...d)
        })
      })
      this.eventsSet = true
    }
    events.forEach(e => {
      delete require.cache[require.resolve(dir('../../events', e[0] + '.' + e[1]))]
      this.events[e[0]] = require(dir('../../events', e[0] + '.' + e[1])).bind(this.client)
    })
    this.client.log(3, 1, `${events.length} events`)
  }

  /**
   * Dispatches an event
   * @param {String} event Event name
   * @param  {...any} d Event packet
   */
  dispatch (event, ...d) {
    if (!this.events[event] || (!['SHARD_READY', 'RESUME'].includes(event) && this.client.cluster.inactive)) return
    this.events[event](...d)
  }
}

module.exports = EventHandler
