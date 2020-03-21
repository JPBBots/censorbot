const Embed = require('../util/Embed')

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

  async send (channel, content) {
    return this.api
      .channels[channel]
      .messages
      .post({
        body: typeof content === 'string' ? { content: content }
          : content instanceof Embed
            ? {
              embed: content.render()
            }
            : content
      })
  }

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

  edit (channel, id, content) {
    return this.api
      .channels[channel]
      .messages[id]
      .patch({
        body: typeof content === 'string' ? { content: content }
          : content instanceof Embed
            ? {
              embed: content.render()
            }
            : content
      })
  }

  async dm (user, content) {
    const channel = await this.createUserDM(user)

    return this.send(channel.id, content)
  }

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
}

module.exports = Interface
