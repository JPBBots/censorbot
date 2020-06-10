const config = require('../../config')

const Logger = require('../../../util/Logger')
const encodeJSON = require('../../../util/encodeJSON')

const Database = require('../services/Database')

const Request = require('../../../req')

const App = require('./App')
const OAuth2 = require('./OAuth2')

/**
 * Base dashboard class
 */
class Manager {
  /**
   * Dashboard Manager
   * @param {Worker} cluster Cluster
   */
  constructor (cluster) {
    /**
     * Cluster
     * @type {Worker}
     */
    this.cluster = cluster

    /**
     * Config
     * @type {Object}
     */
    this.config = config

    /**
     * Logger
     * @type {Logger}
     */
    this.logger = new Logger('Dashboard')

    /**
     * Database
     * @type {?Database}
     */
    this.db = null

    /**
     * Routes app
     * @type {?App}
     */
    this.app = null

    /**
     * OAuth2 Methods
     * @type {?OAuth2}
     */
    this.oauth2 = null

    /**
     * Admin cache of false admins
     * @type {Set<Snowflake>}
     */
    this.adminCache = new Set()

    setInterval(() => this.adminCache.clear(), 900000)

    /**
     * Censor Bot API
     * @type {Request}
     */
    this.capi = Request(`https://${this.base}`, {}, { format: 'text' })
  }

  log (..._) { this.logger.log(..._) }

  async start () {
    this.db = new Database(this, this.config.db.username, this.config.db.password)

    await this.db.connect()

    this.app = new App(this)

    this.oauth2 = new OAuth2(this)

    await this.app.load()

    this.log(`Started :${this.config.port}`)
  }

  async isAdmin (id) {
    if (this.adminCache.has(id)) return false
    const is = !!parseInt(
      await this.capi
        .admin[id]
        .get()
    )
    if (!is) this.adminCache.add(id)

    return is
  }

  async getPremium (id) {
    const res = parseInt(await this.capi
      .premium[id]
      .get()
    )
    if (res < 1) return false

    return res
  }

  // constant urls

  get base () {
    return 'censor.bot'
  }

  get dash () {
    return `https://${this.config.dashPrefix}.${this.base}`
  }

  get login () {
    return `${this.dash}/auth`
  }

  get redirect () {
    return `${this.dash}/auth/callback`
  }

  invite (id) {
    return `https://${this.base}/invite${id ? `?id=${id}` : ''}`
  }

  guildPage (id) {
    return `${this.dash}/${id}`
  }

  oauthLogin (state) {
    return 'https://discord.com/api/oauth2/authorize?' +
      encodeJSON({
        client_id: this.config.oauth.id,
        redirect_uri: this.redirect,
        response_type: 'code',
        scope: 'identify guilds',
        ...(state ? { state } : {})
      })
  }
}

module.exports = Manager
