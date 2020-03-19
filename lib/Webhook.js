const Request = require('../req')
const Embed = require('../util/Embed')

class Webhook {
  constructor (id, token) {
    this.api = Request(`https://discordapp.com/api/webhooks/${id}/${token}`)

    this.me = null
  }

  send (content) {
    return this.api
      .post({
        body: typeof content === 'string' ? { content: content }
          : content instanceof Embed
            ? {
              embeds: [content.render()]
            }
            : content
      })
  }

  async fetch () {
    const res = await this.api
      .get()

    this.me = res
    return res
  }
}

module.exports = Webhook
