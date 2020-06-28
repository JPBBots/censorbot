const Collection = require('../../../util/Collection')

/**
 * Used for managing buckets for message deleting and pop messages
 */
class BucketManager {
  /**
   * Buckets
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client

    /**
     * Buckets
     * @type {Collection.<Snowflake, Array.<Snowflake>>}
     */
    this.buckets = new Collection()

    /**
     * Bucket firsts clear timeouts
     * @type {Collection.<Snowflake, Timeout>}
     */
    this.clears = new Collection()

    /**
     * Timeouts
     * @type {Collection.<Snowflake, Timeout>}
     */
    this.timeouts = new Collection()
  }

  /**
   * Get bucket
   * @param {Snowflake} channel Channel
   * @returns {Array} Editable array
   */
  bucket (channel) {
    if (!this.buckets.has(channel)) this.buckets.set(channel, [])
    return this.buckets.get(channel)
  }

  /**
   * Add message to bucket
   * @param {Snowflake} channel Channel
   * @param {Snowflake} msg Message
   */
  async set (channel, msg) {
    if (!this.clears.has(channel)) {
      const resp = await this.client.interface.delete(channel, msg)
        .catch(err => err.message)
        .then(x => x === true ? null : x)
      this.clears.set(channel, setTimeout(() => {
        this.clears.delete(channel)
      }, 2000))
      return resp
    }

    clearTimeout(this.clears.get(channel))
    this.bucket(channel).push(msg)

    if (this.timeouts.has(channel)) return null

    this.timeouts.set(channel, setTimeout(() => {
      this.delete(channel)
    }, 2000))

    return null
  }

  /**
   * Execute channels bucket
   * @param {Snowflake} channel Channel
   */
  delete (channel) {
    const msgs = this.buckets.get(channel)

    if (!msgs) return

    this.buckets.delete(channel)
    this.timeouts.delete(channel)
    this.clears.delete(channel)

    if (msgs.length < 2) return this.client.interface.delete(channel, msgs[0]).catch(() => {})

    this.client.interface.bulkDelete(channel, msgs)
      .catch(() => {})
  }

  /**
   * Add pop message bucket
   * @param {Snowflake} channel Channel
   * @param {Snowflake} user User
   * @param {Object} db Guild database
   */
  async pop (channel, user, db) {
    if (this.buckets.has(channel + user)) return

    this.buckets.set(channel + user, true)

    const popMsg = await this.client.interface.send(channel,
      this.client.embed
        .color('RED')
        .description(`<@${user}> ${db.msg.content || this.client.config.defaultMsg}`)
    )
    if (popMsg.id && db.msg.deleteAfter) {
      setTimeout(() => {
        this.client.interface.delete(channel, popMsg.id)
          .catch(() => {})
          .then(() => {
            this.buckets.delete(channel + user)
          })
      }, db.msg.deleteAfter)
    } else {
      setTimeout(() => {
        this.buckets.delete(channel + user)
      }, 10000)
    }
  }
}

module.exports = BucketManager
