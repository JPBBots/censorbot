const EventEmitter = require('events')

const CensorBot = require('../src/lib/client/CensorBot')

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
     * Client
     * @type {?CensorBot}
     */
    this.client = null

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
      }: null)
    })

    this.on('SPAWN', ({ shards, shardCount, spawned }) => this.spawn(shards, shardCount, spawned))
    this.on('KILL', () => process.exit(1))
  }

  /**
   * Spawn bot
   * @param {Array.<Number>} shards Array of shard IDs
   * @param {Number} shardCount Shard Count
   * @param {Boolean} spawned Whether already spawned
   */
  spawn (shards, shardCount, spawned) {
    this.client = new CensorBot(this, shards, shardCount)

    this.client.once('READY', () => {
      this.send('READY')

      if (spawned) {
        this.client.presence.d()
      }
    })
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
