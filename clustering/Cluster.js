const resolve = require('path').resolve.bind(undefined, __dirname)

const { Worker } = require('worker_threads')

const EventEmitter = require('events')

/**
 * Cluster broker between Worker and Master
 * @extends {EventEmitter}
 */
class Cluster extends EventEmitter {
  /**
   * Cluster Worker
   * @param {Number} id Cluster ID
   * @param {Array.<Number>} shards Array of shard IDs
   * @param {Master} master Master
   * @param {Boolean} inactive Whether to spawn inactive
   */
  constructor (id, shards, master, inactive = false) {
    super()

    /**
     * Cluster ID
     * @type {Number}
     */
    this.id = id

    /**
     * Array of shard IDs
     * @type {Array.<Number>}
     */
    this.shards = shards

    /**
     * Master
     * @type {Master}
     */
    this.master = master

    /**
     * Whether to spawn inactive
     * @type {Boolean}
     */
    this.inactive = inactive

    /**
     * Whether to be supposed to die
     * @type {Boolean}
     */
    this.dying = false

    /**
     * Worker Thread
     * @type {?Worker}
     */
    this.thread = null

    this.setup()
  }

  /**
   * Setup worker thread
   */
  setup () {
    this.thread = new Worker(resolve('./service.js'), { workerData: { beta: process.argv.includes('-b'), id: this.id, shards: this.shards, shardCount: this.master.shardCount } })

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
   * Send a message to thread
   * @param {String} e Event
   * @param {Object} d Data
   * @param {?Number} i Expected response ID
   */
  send (e, d, i) {
    this.thread.postMessage({ e, d, i })
  }

  /**
   * Spawn shards
   */
  spawn () {
    this.master.log(14, 12, `Cluster ${this.id}`)

    return new Promise((resolve) => {
      this.send('SPAWN', { spawned: this.master.spawned, inactive: this.inactive })

      this.once('READY', () => resolve())
    })
  }
}

module.exports = Cluster
