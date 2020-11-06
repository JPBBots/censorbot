const Cache = require('../util/Cache')
const GetAvatar = require('../util/GetAvatar')
const ParseMessage = require('../util/ParseMessage')

/**
 * Used for methods that should be accessible from everywhere throughout censor bot
 */
class Internals {
  /**
   * Internal Methods
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client

    /**
     * SendAS Webhook Bucket
     * @type {Cache.<Snowflake, Object>}
     */
    this.webhookBucket = new Cache(30000)
  }

  /**
   * Log a censor
   * @param {String} type Type
   * @param {String} content Content
   * @param {Object} user User
   * @param {Snowflake} guild Guild
   * @param {Object} res Filter response
   */
  logCensor (type, content, user, guild, res) {
    this.client.db.collection('stats').updateOne({
      id: 'deleted'
    }, {
      $inc: {
        amount: 1
      }
    })
    if (this.client.cluster.done) {
      this.client.stats.filter.censored.post({
        query: {
          word: res.places.join(','),
          time: res.time,
          filter: res.filters.map(x => `${this.client.filter.filterMasks[x]} (${x})`).join(',')
        }
      })
    }
    this.client.cluster.internal.sendWebhook('swears', {
      content: `\`\`\`${content.replace(/`/g, '\'')}\`\`\``,
      embeds: [
        this.client.embed
          .title(type)
          .description(`<@${user.id}>(${user.id}) in ${guild}`)
          .field('Method', res.filters.join(', '))
          .field('Arg', res.places.map(x => x.toString()).join(', '))
          .render()
      ]
    })
  }

  /**
   * Formatted guild counts
   * @type {Array.<Number>}
   */
  get formatted () {
    return this.client.guilds.reduce((a, b) => {
      a[this.client.options.shards.indexOf(this.client.guildShard(b.id))]++
      return a
    }, Array(this.client.shards.size).fill(0))
  }

  /**
   * Send as another user
   * @param {Snowflake} channel Channel
   * @param {Object} user User
   * @param {String} name Name
   * @param {String|Object|Embed} content Message content
   */
  async sendAs (channel, user, name, content) {
    let webhook = this.webhookBucket.get(channel + user.id)
    if (!webhook) {
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

      this.webhookBucket.set(channel + user.id, webhook, () => {
        this.client.api
          .webhooks[webhook.id][webhook.token]
          .delete()
      })
    }

    await this.client.api
      .webhooks[webhook.id][webhook.token]
      .post({
        query: {
          wait: true
        },
        body: {
          ...ParseMessage(content, true),
          allowed_mentions: {
            parse: ['users']
          }
        }
      })
  }
}

module.exports = Internals
