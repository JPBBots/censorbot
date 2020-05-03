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
    this.interval = setInterval(async () => {
      this.post()
    }, 1800000)

    this.client.log(0, 1, 'DBL')
  }

  /**
   * Post stats
   * @returns {Promise.<Object>} Response
   */
  async post () {
    const guilds = await this.client.cluster.internal.guildCount()
    this.client.log(11, 15, `${guilds.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0)} servers`)
    if (this.client.beta) return this.client.log(11, 16, 'Skipped beta')
    const healthCheck = await this.client.cluster.internal.shardStats()
    if (healthCheck.some(a => a.shards.some(b => !b.connected))) return console.log('Skipping post as there are offline shards!')
    const start = new Date().getTime()
    await this.api
      .bots[this.client.user.id]
      .stats
      .post({
        body: {
          shards: guilds.flat()
        }
      })

    this.client.log(11, 16, `${new Date().getTime() - start}ms`)
    this.client.emit('DBL_POST')
  }
}

module.exports = DBL
