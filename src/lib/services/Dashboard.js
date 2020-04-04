const Express = require('express')
const Request = require('../../../req')
const crypto = require('crypto')

const bit = 0x0000008

const Collection = require('../../../util/Collection')
const encodeJSON = require('../../../util/encodeJSON')
const validateObject = require('../../../util/validateObject')

const cacheTimeout = 300000

class Dashboard {
  constructor (client) {
    this.client = client

    this.app = null
    this.server = null
    this.onReady = null

    this.guilds = new Collection()
    this.caching = new Collection()

    this.api = Request('https://discordapp.com/api')

    this.base = 'https://censorbot.jt3ch.net/dash'
    this.apiUrl = 'https://censorbot.jt3ch.net/api'
  }

  get db () {
    return this.client.db.collection('dashboard')
  }

  spawn () {
    this.client.log(0, 0, 'Dashboard')
    return new Promise(resolve => {
      const start = new Date().getTime()
      this.onReady = () => {
        this.onReady = null
        resolve()
        this.client.log(0, 1, 'Dashboard', `${new Date().getTime() - start}ms:${this.client.config.port}`)
      }
      this.start()
    })
  }

  start () {
    this.app = Express()

    this.load()

    this.server = this.app.listen(this.client.config.port, () => {
      this.onReady()
    })
  }

  close () {
    this.server.close()
  }

  load () {
    this.app.use(
      require('../../dashboard')(this)
    )
  }

  reload () {
    delete require.cache[require.resolve('../../dashboard')]
    this.app._router = null
    this.load()
  }

  get redirectURL () {
    return this.base + '/auth/callback'
  }

  oauthLogin (state) {
    const oauth = this.client.config.oauth

    return 'https://discordapp.com/api/oauth2/authorize?' +
      encodeJSON({
        client_id: oauth.id,
        redirect_uri: this.redirectURL,
        response_type: 'code',
        scope: 'identify guilds',
        ...(state ? { state: state } : {})
      })
  }

  // caching

  getInCache (user) {
    const cache = this.guilds.get(user)

    if (!cache) return false

    const timeout = this.caching.get(user)

    clearTimeout(timeout)

    this.caching.set(user, setTimeout(() => {
      this.guilds.delete(user)
      this.caching.delete(user)
    }, cacheTimeout))

    return cache
  }

  setInCache (user, value) {
    this.guilds.set(user, value)
    this.caching.set(user, setTimeout(() => {
      this.guilds.delete(user)
      this.caching.delete(user)
    }, cacheTimeout))
  }

  // auth

  fail (res, api, state) {
    if (api) res.json({ error: 'Unauthorized' })
    else res.redirect(this.oauthLogin(state))
  }

  async getGuilds (req, state, api = false) {
    const { res } = req

    const token = api ? req.headers.authorization : req.cookies.token

    if (!token) {
      this.fail(res, api, state)
      return false
    }

    const guilds = await this.getUserGuilds(token, res, state, api)
    if (!guilds) return false

    return guilds
  }

  async getUserGuilds (token, res, state, api) {
    const user = await this.db.findOne({
      token: token
    })

    if (!user) {
      this.fail(res, api, state)
      return false
    }

    const isAdmin = await this.client.isAdmin(user.id)

    const cache = this.getInCache(user.id)
    if (cache && isAdmin && state && !cache.some(x => x.i === state)) {
      cache.push({
        i: state,
        n: this.client.guilds.has(state) ? this.client.guilds.get(state).name : '(ADMIN)',
        a: this.client.guilds.has(state) ? this.client.guilds.get(state).icon : null
      })
    }
    if (cache) return cache

    const guilds = await this.fetchGuilds(user.bearer, res, state, api)
    if (!guilds) return false

    this.setInCache(user.id, guilds)

    if (state && !guilds.some(x => x.i === state)) {
      guilds.push({
        i: state,
        n: this.client.guilds.has(state) ? this.client.guilds.get(state).name : '(ADMIN)',
        a: this.client.guilds.has(state) ? this.client.guilds.get(state).icon : null
      })
    }
    return guilds
  }

  async fetchGuilds (bearer, res, state, api) {
    const guilds = await this.api
      .users('@me')
      .guilds
      .get({
        headers: {
          Authorization: `Bearer ${bearer}`
        }
      })
    if (!guilds || !guilds[0]) {
      this.fail(res, api, state)
      return false
    }

    return guilds
      .filter(x => ((x.permissions & bit) !== 0 || x.owner))
      .map(x => {
        return { n: x.name, i: x.id, a: x.icon }
      })
  }

  async fetchUser (bearer) {
    const user = await this.api
      .users['@me']
      .get({
        headers: {
          Authorization: `Bearer ${bearer}`
        }
      })

    if (!user || !user.id) return false
    return user
  }

  get newToken () {
    return crypto.createHash('sha256').update(`${Math.random()}`).update(`${new Date().getTime()}`).update(this.client.config.oauth.mysecret).digest('hex')
  }

  // oauth

  async callback (req) {
    const { res } = req

    if (!req.query.code) return res.json({ error: 'No code' })

    const oauthUser = await this.fetchOAuthUser(req.query.code)
    if (!oauthUser) return res.redirect(this.oauthLogin(req.query.state))

    const user = await this.fetchUser(oauthUser.access_token)
    if (!user) return res.redirect(this.oauthLogin(req.query.state))

    let token

    const dbUser = await this.db.findOne({
      id: user.id
    })
    if (dbUser) {
      token = dbUser.token
    } else {
      token = this.newToken
    }

    await this.db.updateOne({
      id: user.id
    }, {
      $set: {
        id: user.id,
        tag: `${user.username}#${user.discriminator}`,
        token,
        bearer: oauthUser.access_token
      }
    }, {
      upsert: true
    })

    res.cookie('token', token)

    res.redirect(this.base)
  }

  async fetchOAuthUser (code) {
    const oauth = this.client.config.oauth

    const user = await this.api
      .oauth2
      .token
      .post({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: {
          client_id: oauth.id,
          client_secret: oauth.secret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectURL,
          scope: 'identify guilds'
        },
        parser: encodeJSON
      })
    if (!user || !user.access_token) return false
    return user
  }

  // settings

  getGuild (api) {
    return async (req, res, next) => {
      const id = req.params.serverid

      const guilds = await this.getGuilds(req, id, api)
      if (!guilds) return

      const g = guilds.find(x => x.i === id)
      if (!g) return api ? res.json({ error: 'Invalid Guild' }) : res.render('errors/server', { base: this.base })

      req.partialGuild = g
      next()
    }
  }

  guildData (api, fn) {
    return async (req, res) => {
      const { i: id, n: name } = req.partialGuild
      const guild = this.client.guilds.get(id)
      if (!guild) return api ? res.json({ error: 'Not In Guild' }) : res.render('invite', { id })

      const obj = { id, name }

      obj.c = this.client.channels.filter(x => x.guild_id === id)
        .map(x => {
          return {
            id: x.id,
            name: x.name
          }
        })
      obj.r = guild.roles
        .map(x => {
          return {
            id: x.id,
            name: x.name
          }
        })

      obj.db = await this.client.db.config(id)

      fn(req, res, obj)
    }
  }

  validateSettings (obj, guild, f) {
    if (!validateObject(this.client.db.defaultConfig, obj)) return f('Invalid Object')
    if (typeof obj.base !== 'boolean') return f('Base has an invalid type')
    if (typeof obj.censor.msg !== 'boolean') return f('Censor (msg) has an invalid type')
    if (typeof obj.censor.emsg !== 'boolean') return f('Censor (emsg) has an invalid type')
    if (typeof obj.censor.nick !== 'boolean') return f('Censor (nick) has an invalid type')
    if (typeof obj.censor.react !== 'boolean') return f('Censor (react) has an invalid type')
    if (obj.log !== null && ((typeof obj.log !== 'string') || !guild.c.some(x => x.id === obj.log))) return f('Log does not exist on server')
    if ((typeof obj.role !== 'string' && obj.role !== null) || (typeof obj.role === 'string' && !guild.r.some(x => x.id === obj.role))) return f('Role does not exist on server')
    if (!(obj.filter instanceof Array)) return f('Filter has an invalid type')
    if (obj.filter.some(x => x.match(/[^\w]/gi))) return f('A filter entree contains illegal characters')
    if (obj.pop_delete !== null && typeof obj.pop_delete !== 'number') return f('Pop delete has an invalid type')
    if (![0, 1, 2, 3].includes(obj.punishment.type)) return f('Punishment type chosen does not exist')
    if (![0, 1].includes(obj.webhook_replace)) return f('Webhook replace is not valid')
    if (typeof obj.punishment.amount !== 'number' || obj.punishment.amount < 1) return f('Punishment amount cannot be less than 1')
    if ((typeof obj.punishment.role !== 'string' && obj.punishment.role !== null) || (typeof obj.punishment.role === 'string' && !guild.r.some(x => x.id === obj.punishment.role))) return f('Punishment role does not exist on server')
    if (typeof obj.webhook !== 'boolean') return f('Resend has an invalid type')
    if (!(obj.channels instanceof Array)) return f('Ignore channels is an invalid type')
    if (obj.channels.some(x => !guild.c.some(c => c.id === x))) return f('One of the uncensor channels does not exist on server')
    if (!(obj.uncensor instanceof Array)) return f('Uncensor is an invalid type')
    if (obj.uncensor.some(x => x.match(/[^\w]/gi))) return f('One of the uncensor words contains illegal characters')
    if (typeof obj.multi !== 'boolean') return f('Multi-Line is an invalid type')
    if (!(obj.languages instanceof Array)) return f('Languages is an invalid type')
    if (obj.languages.some(x => !this.client.db.defaultConfig.languages.includes(x))) return f('Languages contains an invalid language')
    return true
  }

  // premium

  async premium (id) {
    const premium = parseInt(await this.client
      .capi
      .premium[id]
      .get()
    )
    if (premium < 1) return { premium: false }

    const user = { premium: true, amount: premium }

    const dbUser = await this.client.db.collection('premium_users').findOne({ id })

    if (!dbUser) {
      await this.client.db.collection('premium_users').updateOne({ id }, {
        $set: {
          id,
          guilds: []
        }
      })
      user.guilds = []
    } else user.guilds = dbUser.guilds

    return user
  }

  premiumMiddle (api, fn) {
    return async (req, res, next) => {
      const user = await this.db.findOne({ token: api ? req.headers.authorization : req.cookies.token })

      if (!user) return api ? res.json({ error: 'Unauthorized' }) : res.redirect(this.oauthLogin('premium'))

      const prem = await this.premium(user.id)
      if (!prem.premium) return api ? res.json({ error: 'Not premium' }) : res.render('errors/notpremium')

      req.user = user
      req.premium = prem

      if (!fn) return next()

      const guilds = await this.getGuilds(req, 'premium')
      if (!guilds) return

      fn(req, res, user, prem, guilds)
    }
  }

  // admin

  adminMiddle (api, fn) {
    return async (req, res, next) => {
      const user = await this.db.findOne({ token: api ? req.headers.authorization : req.cookies.token })

      if (!user) return api ? res.json({ error: 'Unauthorized' }) : res.redirect(this.oauthLogin('admin'))

      const admin = await this.client.isAdmin(user.id)

      if (!admin) return api ? res.json({ error: 'Not Admin' }) : res.render('errors/notadmin', { base: this.base })

      req.user = user

      fn ? fn(req, res) : next()
    }
  }
}

module.exports = Dashboard
