const Request = require('../req')

const ParseMessage = require('../util/ParseMessage')

class Webhook {
  constructor (id, token) {
    this.api = Request(`https://discordapp.com/api/webhooks/${id}/${token}`)

    this.me = null
  }

  send (content) {
    return this.api
      .post({
        body: ParseMessage(content)
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
