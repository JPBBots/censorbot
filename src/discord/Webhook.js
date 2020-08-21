const Request = require('../util/req')

const ParseMessage = require('../util/ParseMessage')

/**
 * Used for preset webhook clients and interacting with them
 */
class Webhook {
  constructor (id, token) {
    /**
     * Webhook API
     * @type {Request}
     */
    this.api = Request(`https://discord.com/api/webhooks/${id}/${token}`)

    /**
     * Webhook object (if fetched)
     * @type {Object}
     */
    this.me = null
  }

  /**
   * Send a message
   * @param {String|Object|Embed} content Content of message
   * @returns {Promise.<Object>} Message object
   */
  send (content) {
    return this.api
      .post({
        body: ParseMessage(content, true)
      })
  }

  /**
   * Fetch webhook
   * @returns {Promise.<Object>} Webhook object
   */
  async fetch () {
    const res = await this.api
      .get()

    this.me = res
    return res
  }
}

module.exports = Webhook
