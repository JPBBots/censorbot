const wait = (t) => new Promise(resolve => setTimeout(resolve, t))

class Bucket {
  constructor (id, manager) {
    this.id = id
    this.manager = manager

    this.working = false
    this.queue = []

    this.remaining = -1
    this.reset = -1
  }

  _resetTimer () {
    this.manager.buckets._resetTimer(this.id)
  }

  add (req) {
    this.queue.push(req)

    this.run()
  }

  async run (next) {
    if (!next && this.working) return

    const req = this.queue.shift()

    if (!req) {
      this.working = false

      return
    }

    this.working = true

    this._resetTimer()

    if (this.manager.global) {
      await this.manager.global
    } else if (this.remaining <= 0 && Date.now() < this.reset) {
      await wait(this.reset + 500 - Date.now())
    }

    const { res, json } = await this.manager.request(req)

    const date = new Date(res.headers.get('Date'))
    const retryAfter = Number(res.headers.get('Retry-After'))

    const remaining = res.headers.get('X-RateLimit-Remaining')
    const reset = Number(res.headers.get('X-RateLimit-Reset'))

    this.remaining = remaining ? Number(remaining) : 1
    this.reset = reset ? (new Date(reset * 1000).getTime() - (date.getTime() - Date.now())) : Date.now()

    const global = Boolean(res.headers.get('X-RateLimit-Global'))

    if (global) {
      this.manager.global = wait(retryAfter)

      await this.manager.global

      this.manager.global = null
    }

    if (res.status === 429) {
      this.queue.unshift(req)

      await wait(retryAfter)
    } else {
      req.resolve(json)
    }

    this.run(true) // run next item
  }
}

module.exports = Bucket
