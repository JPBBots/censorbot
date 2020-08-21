/**
 * Used for each instance of ran commands for easier interaction and customizable actions
 */
class Command {
  /**
   * For handling messages to a command site
   * @param {CommandHandler} CommandHanlder Command Handler
   * @param {Object} message Message object
   * @param {Cmd} cmd Command object
   */
  constructor (CommandHandler, message, cmd) {
    /**
     * Client
     * @type {Client}
     */
    this.client = CommandHandler.client

    /**
     * Command Handler
     * @type {CommandHandler}
     */
    this.handler = CommandHandler

    /**
     * Command object
     * @type {Object}
     */
    this.cmd = cmd

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
   * Guild message was sent in
   * @type {Object}
   */
  get guild () {
    return this.client.guilds.get(this.msg.guild_id)
  }

  /**
   * Channel message was sent in
   * @type {Object}
   */
  get channel () {
    return this.client.channels.get(this.msg.channel_id)
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

  invokeCooldown () {
    if (!this.cmd.info.cooldown) return
    this.handler.cooldowns.set(`${this.msg.author.id}${this.cmd.info.name}`, Date.now() + (this.cmd.info.cooldown * 60000))

    setTimeout(() => {
      this.handler.cooldowns.delete(`${this.msg.author.id}${this.cmd.info.name}`)
    }, this.cmd.info.cooldown * 60000)
  }
}

module.exports = Command
