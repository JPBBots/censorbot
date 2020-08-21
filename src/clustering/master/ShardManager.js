const Collection = require('../../util/Collection')
const Wait = require('../../util/Wait')

const Timeout = new Wait(6000)

/**
 * Shard manager for taking spawning requests and starting them
 */
class ShardManager {
  /**
   * Shard Master
   * @param {Master} master Master
   */
  constructor (master) {
    /**
     * Master
     * @type {Master}
     */
    this.master = master

    /**
     * Shard queue
     * @type {Collection.<Number, Number>}
     */
    this.queue = new Collection()

    /**
     * Whether or not sharder is in the process of looping
     * @type {Boolean}
     */
    this.looping = false
  }

  /**
   * Add shard spawn to queue
   * @param {Number} shard Shard to spawn
   */
  addShard (shard) {
    this.queue.set(shard, shard)

    if (!this.looping && this.master.spawned) this.spawn()
  }

  async spawn () {
    const nextShard = this.queue.first()
    if (nextShard === undefined) {
      this.looping = false

      this.master.presence.go()
      return
    }

    this.looping = true

    const cluster = this.master.api.shardCluster(nextShard)
    if (!cluster) {
      this.looping = false
      return
    }

    await cluster.send('SPAWN_SHARD', { id: nextShard }, true)

    this.queue.delete(nextShard)

    await Timeout.wait()

    return this.spawn()
  }
}

module.exports = ShardManager
