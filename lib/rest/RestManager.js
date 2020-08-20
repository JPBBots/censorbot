const fetch = require('node-fetch')

const Cache = require('../../util/Cache')
const encodeJSON = require('../../util/encodeJSON')

const Bucket = require('./Bucket')
const RouteBuilder = require('./RouteBuilder')

class RestManager {
  constructor (token) {
    this.token = token
    this.buckets = new Cache(60000)

    this.global = null

    this.statuses = {}

    this.builder = RouteBuilder
  }

  _key (route) {
    const bucket = []

    for (let i = 0; i < route.length; i++) {
      if (route[i - 1] === 'reactions') break
      if (/\d{16,19}/g.test(route[i]) && !/channels|guilds/.test(route[i - 1])) bucket.push(':id')
      else bucket.push(route[i])
    }

    return bucket.join('-')
  }

  run (method, route, options) {
    return new Promise((resolve) => {
      const key = this._key(route)

      let bucket = this.buckets.get(key)

      if (!bucket) {
        bucket = new Bucket(key, this)
        this.buckets.set(key, bucket)
      }

      bucket.add({ method, route, options, resolve })
    })
  }

  async request ({ method, route, options }) {
    const headers = {}

    if (this.token) headers.Authorization = `Bot ${this.token}`

    if (options.body) headers['Content-Type'] = 'application/json'
    if (options.reason) headers['X-Audit-Log-Reason'] = options.reason

    headers['User-Agent'] = 'DiscordBot (censor.bot, v9)'

    const res = await fetch(`https://discord.com/api/v7/${route.join('/')}${options.query ? `?${encodeJSON(options.query)}` : ''}`, {
      method, headers: { ...headers, ...(options.headers || {}) }, body: options.body ? (options.parser || JSON.stringify)(options.body) : null
    })

    if (!this.statuses[res.status]) this.statuses[res.status] = 0

    this.statuses[res.status]++

    const json = res.status === 204 ? { success: true } : await res.json()

    return { res, json }
  }
}

module.exports = RestManager
