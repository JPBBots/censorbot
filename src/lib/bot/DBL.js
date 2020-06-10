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

    /**
     * DBL API
     * @type {Request}
     */
    this.api = Request('https://top.gg/api', { Authorization: client.config.dbl })

    /**
     * Posting interval
     * @type {Interval}
     */
    this.interval = setInterval(async () => {
      this.post()
    }, 1800000)
  }

  /**
   * Post stats
   * @returns {Promise.<Object>} Response
   */
  async post () {
    const guilds = await this.client.cluster.internal.guildCount()

    const healthCheck = await this.client.cluster.internal.shardStats()
    if (healthCheck.some(a => a.shards.some(b => !b.connected))) return console.log('Skipping post as there are offline shards!')
    await this.api
      .bots[this.client.user.id]
      .stats
      .post({
        body: {
          shards: guilds.flat()
        }
      })

    this.client.emit('DBL_POST')
  }
}

module.exports = DBL
