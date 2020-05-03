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
   */
  constructor (id, shards, master) {
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
    this.thread = new Worker('../clustering/service.js', { workerData: { id: this.id } })

    this.thread.on('message', (msg) => {
      this.emit(msg.e, msg.d, msg.i)
    })

    this.thread.on('exit', (code) => {
      this.master.log(14, 10, `Cluster ${this.id}`, code)

      this.setup()
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
      this.send('SPAWN', { shards: this.shards, shardCount: this.master.shardCount, spawned: this.master.spawned })

      this.once('READY', () => resolve())
    })
  }
}

module.exports = Cluster
