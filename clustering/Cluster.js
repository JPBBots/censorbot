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
   * @param {Number} job Job of cluster
   * @param {Array.<Number>} shards Array of shard IDs
   * @param {Master} master Master
   * @param {Boolean} inactive Whether to spawn inactive
   */
  constructor (id, job, shards, master, inactive = false) {
    super()

    /**
     * Cluster ID
     * @type {Number}
     */
    this.id = id

    /**
     * Job of cluster
     * @type {Number}
     */
    this.job = job

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
    this.thread = new Worker(resolve('./service.js'), { workerData: { beta: process.argv.includes('-b'), id: this.id, job: this.job, shards: this.shards, shardCount: this.master.shardCount } })

    this.thread.on('message', (msg) => {
      this.emit(msg.e, msg.d, msg.i)
    })

    this.thread.on('exit', (code) => {
      if (!this.dying) this.setup()
    })

    this.thread.on('error', (err) => {
      console.error(err)
    })

    if (this.master.spawned) this.spawn()
  }

  /**
   * Send a message to thread
   * @param {String} e Event
   * @param {Object} d Data
   * @param {?Number} i Expected response ID
   */
  _send (e, d, i) {
    this.thread.postMessage({ e, d, i })
  }

  /**
   * Sends data to a cluster
   * @param {String} event Event Name
   * @param {?Object} data Data object
   * @param {Boolean} respond Whether to get the response of it
   * @returns {void|Promise.<Object>} Response data
   */
  send (event, data, respond = false) {
    if (!respond) {
      this._send(event, data)
    } else {
      return new Promise(resolve => {
        const id = Number(new Date().getTime() + `${Math.random() * 10000}`).toFixed(0)

        const getFunction = (d, i) => {
          if (i !== id) return

          this.off(event, getFunction)

          resolve(d)
        }

        this.on(event, getFunction)

        this._send(event, data, id)
      })
    }
  }

  /**
   * Spawn shards
   */
  spawn () {
    return new Promise((resolve) => {
      this.send('SPAWN', { spawned: this.master.spawned, inactive: this.inactive })

      this.once('READY', () => resolve())
    })
  }
}

module.exports = Cluster
