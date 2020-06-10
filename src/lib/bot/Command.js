/**
 * Used for each instance of ran commands for easier interaction and customizable actions
 */
class Command {
  /**
   * For handling messages to a command site
   * @param {Client} client Client
   * @param {Object} message Message object
   */
  constructor (client, message) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client

    /**
     * Message Object
     * @type {Object}
     */
    this.msg = message
  }

  /**
   * Client config
   * @type {Object}
   */
  get config () {
    return this.client.config
  }

  /**
   * New embed
   * @type {Embed}
   */
  get embed () {
    return this.client.embed
  }

  /**
   * Sends a message to the channel
   * @param {String|Object|Embed} content Content of message
   * @returns {Promise.<Object>} Message object
   */
  send (content) {
    return this.client.interface.send(this.msg.channel_id, content)
  }

  /**
   * Deletes instantiating message
   */
  delete () {
    try {
      return this.client.interface.delete(this.msg.channel_id, this.msg.id)
    } catch (err) {

    }
  }
}

module.exports = Command
