const config = require('../../config')

const Logger = require('../../../util/Logger')
const encodeJSON = require('../../../util/encodeJSON')

const Database = require('../services/Database')

const Request = require('../../../req')

const App = require('./App')
const OAuth2 = require('./OAuth2')

const Interface = require('../../../lib/Interface')
const RestManager = require('../../../lib/rest/RestManager')

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
    this.logger = new Logger('API')

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
    this.capi = Request('https://api.jt3ch.net', {}, { format: 'text' })

    /**
     * Rest Manager
     * @type {RestManager}
     */
    this.rest = new RestManager(this.config.token)

    /**
     * Discord interface
     * @type {Interface}
     */
    this.interface = new Interface(this)
  }

  get api () {
    return this.rest.builder()
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

  guildPage (id) {
    return `${this.dash}/${id}`
  }

  oauthLogin (ext, host) {
    return `https://${ext ? `${ext}.` : ''}discord.com/oauth2/authorize?` +
      encodeJSON({
        client_id: this.config.oauth.id,
        redirect_uri: `https://${host}/api/auth/callback`,
        response_type: 'code',
        prompt: 'none',
        scope: 'identify guilds'
      })
  }
}

module.exports = Manager
