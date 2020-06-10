const EventEmitter = require('events')

const jobs = require('./Jobs')

const WorkerInternals = require('./WorkerInternals')

/**
 * Worker Thread
 * @extends {EventEmitter}
 */
class Worker extends EventEmitter {
  /**
   * Worker
   * @param {Object} data Worker Data
   * @param {ParentPort} parent Parent
   */
  constructor (data, parent) {
    super()

    /**
     * Master Broker
     * @type {ParentPort}
     */
    this.parent = parent

    /**
     * Cluser ID
     * @type {?Number}
     */
    this.id = data.id

    /**
     * Job
     * @type {Job}
     */
    this.job = jobs[data.job]

    const Client = require(this.job.client)

    /**
     * Client
     */
    this.client = new Client(this, data.shards, data.shardCount)

    /**
     * Internal Methods
     */
    this.internal = new WorkerInternals(this)

    this.setup()
  }

  /**
   * Setup events
   */
  setup () {
    this.parent.on('message', (msg) => {
      this.emit(msg.e, msg.d)

      this.internal.event(msg.e, msg.d, msg.i ? (data) => {
        this.send(msg.e, data, msg.i)
      } : null)
    })

    this.on('SPAWN', ({ spawned, inactive }) => this.spawn(spawned, inactive))
    this.on('KILL', () => process.exit(1))
  }

  /**
   * Spawn bot
   * @param {Boolean} spawned Whether already spawned
   * @param {Boolean} inactive Whether to spawn inactive
   */
  async spawn (spawned, inactive) {
    this.inactive = inactive

    await this.client.start()

    if (spawned && this.job.i === 0) this.client.presence.d()

    this.send('READY')
  }

  /**
   * Sends a message to the parent
   * @param {String} e Event
   * @param {Object} d Data
   * @param {?Number} i Response ID
   */
  send (e, d, i) {
    this.parent.postMessage({ e, d, i })
  }
}

module.exports = Worker
