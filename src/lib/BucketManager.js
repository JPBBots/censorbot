const Collection = require('../../util/Collection')

class BucketManager {
  constructor (client) {
    this.client = client

    this.client.log(0, 0, 'BucketManager')

    this.buckets = new Collection()
    this.clears = new Collection()
    this.timeouts = new Collection()

    this.client.log(0, 1, 'BucketManager')
  }

  bucket (channel) {
    if (!this.buckets.has(channel)) this.buckets.set(channel, [])
    return this.buckets.get(channel)
  }

  async set (channel, msg) {
    if (!this.clears.has(channel)) {
      const resp = await this.client.deleteMessage(channel, msg)
        .catch(err => err.message)
        .then(x => x === true ? null : x)
      this.clears.set(channel, setTimeout(() => {
        this.clears.delete(channel)
      }, 2000))
      return resp
    }

    clearTimeout(this.clears.get(channel))
    this.bucket(channel).push(msg)

    if (this.timeouts.has(channel)) return null

    this.timeouts.set(channel, setTimeout(() => {
      this.delete(channel)
    }, 2000))

    return null
  }

  delete (channel) {
    const msgs = this.buckets.get(channel)

    if (!msgs) return

    this.buckets.delete(channel)
    this.timeouts.delete(channel)
    this.clears.delete(channel)

    if (msgs.length < 2) return this.client.deleteMessage(channel, msgs[0])

    this.client.api
      .channels[channel]
      .messages('bulk-delete')
      .post({
        body: {
          messages: msgs
        }
      })
      .catch(() => {})
  }

  pop (channel, user, db) {
    if (!this.clears.has(channel + user)) {
      this.popMsg(channel, user, db)
      return this.clears.set(channel + user, setTimeout(() => {
        this.clears.delete(channel + user)
      }, 2000))
    }

    clearTimeout(this.clears.get(channel + user))

    if (this.timeouts.has(channel + user)) return

    this.timeouts.set(channel + user, setTimeout(() => {
      this.popMsg(channel, user, db)
    }, 2000))
  }

  async popMsg (channel, user, db) {
    this.clears.delete(channel + user)
    this.timeouts.delete(channel + user)

    const popMsg = await this.client.sendMessage(channel,
      this.client.embed
        .color('RED')
        .description(`<@${user}> ${db.msg || this.client.config.defaultMsg}`)
    )
    if (popMsg.id) {
      if (db.pop_delete) {
        setTimeout(() => {
          this.client.deleteMessage(channel, popMsg.id)
            .catch(() => {})
        }, db.pop_delete)
      }
    }
  }
}

module.exports = BucketManager
