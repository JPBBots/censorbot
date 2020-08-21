const Request = require('../../util/req')

/**
 * Used for interacting with the DBL (top.gg) api
 */
class DBL {
  /**
   * DBL interface
   * @param {Master} master Master
   * @param {String} dbl DBL token
   */
  constructor (master, dbl) {
    /**
     * Master
     * @type {Master}
     */
    this.master = master

    /**
     * DBL API
     * @type {Request}
     */
    this.api = Request('https://top.gg/api', { Authorization: dbl })
  }

  /**
   * Post stats
   * @returns {Promise.<Object>} Response
   */
  async post () {
    if (this.master.beta) return this.master.log('Beta mode on, skipping post')
    const guilds = await this.master.api.sendToAll('GUILD_COUNT', {}, true)

    const healthCheck = await this.master.api.sendToAll('CLUSTER_STATS', {}, true)
    if (healthCheck.some(a => a.shards.some(b => !b.connected))) return this.master.log('Skipping post as there are offline shards!')
    await this.api
      .bots
      .stats
      .post({
        body: {
          shards: guilds.flat()
        }
      })
  }
}

module.exports = DBL
