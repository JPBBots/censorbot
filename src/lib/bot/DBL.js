const Request = require('../../../req')

/**
 * Used for interacting with the DBL (top.gg) api
 */
class DBL {
  /**
   * DBL interface
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client
    this.client.log(0, 0, 'DBL')

    /**
     * DBL API
     * @type {Request}
     */
    this.api = Request('https://top.gg/api', { Authorization: client.config.dbl })

    /**
     * Posting interval
     * @type {Interval}
     */
    this.interval = setInterval(() => {
      this.client.log(11, 15, `${this.client.guilds.size} servers`)
      this.post()
    }, 1800000)

    this.client.log(0, 1, 'DBL')
  }

  /**
   * Post stats
   * @returns {Promise.<Object>} Response
   */
  async post () {
    if (this.client.beta) return this.client.log(11, 16, 'Skipped beta')
    if (this.client.shards.some(x => !x.connected)) return console.log('Skipping post as there are offline shards!')
    const start = new Date().getTime()
    await this.api
      .bots[this.client.user.id]
      .stats
      .post({
        body: {
          shards: this.formatted
        }
      })

    this.client.log(11, 16, `${new Date().getTime() - start}ms`)
    this.client.emit('DBL_POST')
  }

  /**
   * Formatted guild counts
   * @type {Array.<Integer>}
   */
  get formatted () {
    return this.client.guilds.reduce((a, b) => {
      a[this.client.guildShard(b.id)]++
      return a
    }, this.client.shards.reduce((a) => a.concat([0]), []))
  }
}

module.exports = DBL
