const Request = require('../../req')

class DBL {
  constructor (client) {
    this.client = client
    this.client.log(0, 0, 'DBL')
    this.api = Request('https://top.gg/api', { Authorization: client.config.dbl })

    this.timeout = null

    setTimeout(() => {
      this.client.log(11, 15, `${this.client.guilds.size} servers`)
      this.post()
    }, 1800000)

    this.client.log(0, 1, 'DBL')
  }

  async post () {
    if (this.client.beta) return this.client.log(11, 16, 'Skipped beta')
    if (this.client.shards.some(x => !x.connected)) return console.log('Skipping post as there are offline shards!')
    const start = new Date().getTime()
    await this.api
      .bots[this.client.user.id]
      .stats
      .post({
        body: {
          server_count: this.client.guilds.size,
          shard_count: this.client.shards.size
        }
      })

    this.client.log(11, 16, `${new Date().getTime() - start}ms`)
    this.client.emit('DBL_POST')
  }
}

module.exports = DBL
