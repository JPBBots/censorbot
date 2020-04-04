const Webhook = require('../../../lib/Webhook')

const Collection = require('../../../util/Collection')
const GetAvatar = require('../../../util/GetAvatar')
const ParseMessage = require('../../../util/ParseMessage')

class WebhookManager {
  /**
   * Webhook Manager
   * @param {Client} client Client 
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client
    this.client.log(0, 0, 'WebhookManager')

    /**
     * Webhooks
     * @type {Collection.<String, Webhook>}
     */
    this.webhooks = new Collection()

    /**
     * SendAS Webhook Bucket
     * @type {Collection.<Snowflake, Object>}
     */
    this.bucket = new Collection()

    this.client.log(0, 1, 'WebhookManager')
  }

  /**
   * Load webhooks
   */
  async load () {
    const start = new Date().getTime()
    const wh = this.client.config.webhooks
    this.client.log(10, 0, Object.keys(wh).length)
    for (let i = 0; i < Object.keys(wh).length; i++) {
      const key = Object.keys(wh)[i]
      await this.loadWebhook(key, wh[key])
    }
    this.client.log(10, 1, 'All', `${new Date().getTime() - start}ms`)
  }

  /**
   * Load a webhook
   * @param {String} name Name of webhook
   * @param {Object} obj Config object
   */
  async loadWebhook (name, obj) {
    const wh = new Webhook(obj.id, obj.token)
    await wh.fetch()
    this.webhooks.set(name, wh)
    this.client.log(10, 7, name, wh.me.name)
  }

  /**
   * Send to webhook
   * @param {String} name Name of webhook
   * @param {String|Object|Embed} content Message content
   */
  send (name, content) {
    this.webhooks.get(name).send(content)
  }

  /**
   * Send as another user
   * @param {Snowflake} channel Channel
   * @param {Object} user User
   * @param {String} name Name
   * @param {String|Object|Embed} content Message content
   */
  async sendAs (channel, user, name, content) {
    let webhook
    let bucketed = false
    if (this.bucket.has(channel + user.id)) {
      bucketed = true
      webhook = this.bucket.get(channel + user.id)
    } else {
      const avatar = await GetAvatar(user.id, user.avatar, user.discriminator)
      webhook = await this.client.api
        .channels[channel]
        .webhooks
        .post({
          body: {
            name,
            avatar
          }
        })
      this.bucket.set(channel + user.id, webhook)
    }

    await this.client.api
      .webhooks[webhook.id][webhook.token]
      .post({
        query: {
          wait: true
        },
        body: ParseMessage(content, true)
      })

    if (bucketed) return

    setTimeout(() => {
      this.bucket.delete(channel + user.id)

      this.client.api
        .webhooks[webhook.id][webhook.token]
        .delete()
    }, 15000)
  }
}

module.exports = WebhookManager
