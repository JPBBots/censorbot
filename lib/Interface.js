const ParseMessage = require('../util/ParseMessage')

/**
 * @typedef {String} Snowflake Discord ID
 */

class Interface {
  constructor (client) {
    this.client = client
  }

  get api () {
    return this.client.api
  }

  get utils () {
    return this.client.utils
  }

  /**
   * Delete a message
   * @param {Snowflake} channel Channel message is in
   * @param {Snowflake} id Message to delete
   * @returns {Promise} Promise
   */
  async delete (channel, id) {
    const response = await this.api
      .channels[channel]
      .messages[id]
      .delete()

    if (response.success) return true

    throw new Error(
      this.utils.errors[response.code] || `(Raw Discord Error) ${response.message}`
    )
  }

  /**
   * Send a message
   * @param {Snowflake} channel Channel to send in
   * @param {String | Object | Embed} content Content of message
   * @returns {Promise.<Object>} Message object
   */
  async send (channel, content) {
    return this.api
      .channels[channel]
      .messages
      .post({
        body: ParseMessage(content)
      })
  }

  /**
   * Set a guild member's nickname
   * @param {Snowflake} guild Guild of member
   * @param {Snowflake} user Member
   * @param {String} nick Nickname to set member as
   * @returns {Promise} Promise
   */
  async nickname (guild, user, nick) {
    const response = await this.api
      .guilds[guild]
      .members[user]
      .patch({
        body: {
          nick: nick
        }
      })

    if (response.success) return true

    throw new Error(
      this.utils.errors[response.code] || `(Raw Discord Error) ${response.message}`
    )
  }

  /**
   * Deletes a reaction off a message
   * @param {Snowflake} channel Channel message is in
   * @param {Snowflake} message Message
   * @param {String} reaction Reaction to remove
   * @param {Snowflake} user User to remove from reaction
   * @returns {Promise} Promise
   */
  async removeReaction (channel, message, reaction, user) {
    const response = await this.api
      .channels[channel]
      .messages[message]
      .reactions[reaction.match(/^[0-9]*$/) ? `e:${reaction}` : encodeURIComponent(reaction)] // eslint-disable-line func-call-spacing
      (user) // eslint-disable-line no-unexpected-multiline
      .delete()

    if (response.success) return true

    throw new Error(
      this.utils.errors[response.code] || `(Raw Discord Error) ${response.message}`
    )
  }

  /**
   * Adds a reaction to a message
   * @param {Snowflake} channel Channel message is in
   * @param {Snowflake} message Message
   * @param {String} reaction Reaction
   * @returns {Promise} Promise
   */
  async addReaction (channel, message, reaction) {
    const response = await this.api
      .channels[channel]
      .messages[message]
      .reactions[reaction.match(/^[0-9]*$/) ? `e:${reaction}` : encodeURIComponent(reaction)] // eslint-disable-line func-call-spacing
      ('@me') // eslint-disable-line no-unexpected-multiline
      .put()

    if (response.success) return true

    throw new Error(
      this.utils.errors[response.code] || `(Raw Discord Error) ${response.message}`
    )
  }

  /**
   * Edits a message
   * @param {Snowflake} channel Channel message is in
   * @param {Snowflake} id Message
   * @param {String|Object|Embed} content Content of message
   * @returns {Promise.<Object>} Edited Message
   */
  edit (channel, id, content) {
    return this.api
      .channels[channel]
      .messages[id]
      .patch({
        body: ParseMessage(content)
      })
  }

  /**
   * DM a user
   * @param {Snowflake} user User
   * @param {String|Object|Embed} content Content of message
   * @returns {Promise.<Object>} Message object
   */
  async dm (user, content) {
    const channel = await this.createUserDM(user)

    return this.send(channel.id, content)
  }

  /**
   * Creates a user DM
   * @param {Snowflake} user User
   * @returns {Promise.<Object>} User channel
   */
  async createUserDM (user) {
    const response = await this.api
      .users['@me']
      .channels
      .post({
        body: {
          recipient_id: user
        }
      })

    if (!response.id) throw new Error('Cannot DM User')
    return response
  }

  /**
   * Edit a channel
   * @param {Snowflake} channel Channel to edit
   * @param {Object} obj Edit object
   * @returns {Promise.<Object>} Edited channel object
   */
  editChannel (channel, obj) {
    return this.api
      .channels[channel]
      .patch({
        body: obj
      })
  }

  /**
   * Bulk-Delete messages
   * @param {Snowflake} channel Channel to delete messages in
   * @param {Array.<Snowflake>} messages Messages to delete
   * @returns {Promise} Promise
   */
  bulkDelete (channel, messages) {
    return this.api
      .channels[channel]
      .messages('bulk-delete')
      .post({
        body: {
          messages
        }
      })
  }

  /**
   * Add a role to a member
   * @param {Snowflake} guild Guild of member
   * @param {Snowflake} user Member
   * @param {Snowflake} role Role to add
   * @param {String} reason Reason
   * @returns {Promise} Promise
   */
  addRole (guild, user, role, reason) {
    return this.api
      .guilds[guild]
      .members[user]
      .roles[role]
      .put({ reason })
  }

  /**
   * Kick a member from a guild
   * @param {Snowflake} guild Guild of member
   * @param {Snowflake} user Member
   * @param {String} reason Reason
   * @returns {Promise} Promise
   */
  kick (guild, user, reason) {
    return this.api
      .guilds[guild]
      .members[user]
      .delete({ reason })
  }

  /**
   * Ban a member from a guild
   * @param {Snowflake} guild Guild of member
   * @param {Snowflake} user Member
   * @param {String} reason Reason
   * @returns {Promise} Promise
   */
  ban (guild, user, reason) {
    return this.api
      .guilds[guild]
      .bans[user]
      .put({
        query: { reason }
      })
  }

  /**
   * Leave a guild
   * @param {Snowflake} id Guild
   * @returns {Promise} Promise
   */
  leaveGuild (id) {
    return this.api
      .users['@me']
      .guilds[id]
      .delete()
  }
}

module.exports = Interface
