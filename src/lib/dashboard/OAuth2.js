const Request = require('../../../req')

const Collection = require('../../../util/Collection')
const encodeJSON = require('../../../util/encodeJSON')

const Crypto = require('crypto')

/**
 * Guilds cached for oauth/dashboard use
 * @typedef {Object} CachedGuild
 * @property {Snowflake} i ID of guild
 * @property {String} n Name of guild
 * @property {String} a Icon hash of guild
 * @property {Array.<Channel>} c Channels
 * @property {Array.<Role>} r Roles
 */

/**
 * OAuth2 Methods
 */
class OAuth2 {
  /**
   * OAuth2
   * @param {Manager} manager Manager
   */
  constructor (manager) {
    /**
     * Manager
     * @type {Manager}
     */
    this.manager = manager

    /**
     * Discord API
     * @type {Request}
     */
    this.api = new Request('https://discord.com/api')

    /**
     * Guild cache
     * @type {Collection.<Token, Array.<CachedGuild>>}
     */
    this.guildCache = new Collection()

    /**
     * Timeouts of cache dumping
     * @type {Collection.<Token, Timeout>}
     */
    this.timeouts = new Collection()
  }

  get db () {
    return this.manager.db.collection('users')
  }

  get config () {
    return this.manager.config
  }

  /**
   * Get in cache
   * @param {Token} token Token
   */
  _get (token) {
    if (!this.guildCache.has(token)) return

    clearTimeout(this.timeouts.get(token))

    this._set(token)

    return this.guildCache.get(token)
  }

  /**
   * Set guilds into cache
   * @param {Token} token Token of user to cache
   * @param {Array.<CachedGuild>} guilds Array of cached guilds
   */
  _set (token, guilds) {
    if (guilds) this.guildCache.set(token, guilds)

    this.timeouts.set(token, setTimeout(() => {
      this.guildCache.delete(token)
      this.timeouts.delete(token)
    }, this.config.dashOptions.guildCacheWipeTimeout))
  }

  /**
   * Creates a token
   * @returns {String} New Token
   */
  createToken () {
    return Crypto.createHash('sha256')
      .update(Crypto.randomBytes(8).toString('hex'))
      .update(`${Date.now()}`)
      .update(`${this.config.oauth.mysecret}`)
      .digest('hex')
  }

  async callback (code) {
    const oauthUser = await this._bearer(code)
    if (!oauthUser) throw new Error('Invalid Code')

    if (!oauthUser.scope.includes('identify') || !oauthUser.scope.includes('guilds')) throw new Error('Invalid Scopes') // double check cuz y not

    const user = await this._user(oauthUser.access_token)
    if (!user) throw new Error('Invalid User')

    let token

    const currentUser = await this.db.findOne({ id: user.id })
    if (currentUser) {
      token = currentUser.token

      await this.db.updateOne({ id: user.id }, { $set: { bearer: oauthUser.access_token } })
    } else {
      token = this.createToken()

      await this.db.insertOne({ id: user.id, token, bearer: oauthUser.access_token })
    }

    return token
  }

  async getGuilds (token) {
    const cache = this._get(token)

    const user = await this.db.findOne({ token })
    if (!user) return false

    user.admin = await this.manager.isAdmin(user.id)

    if (cache) return { user, guilds: cache }

    const guilds = await this._guilds(user.bearer)
    if (!guilds) return false

    this._set(token, guilds)

    return { guilds, user }
  }

  /**
   * Fetches guilds of whom bearer belongs to
   * @param {String} bearer User bearer
   * @returns {Array.<CachedGuild>} Array of fetched guilds
   */
  async _guilds (bearer) {
    const guilds = await this.api
      .users['@me']
      .guilds
      .get({
        headers: {
          Authorization: `Bearer ${bearer}`
        }
      })

    if (!guilds || guilds.constructor !== Array) return false

    return guilds
      .filter(x => (x.permissions & this.config.dashOptions.requiredPermissionBit) !== 0 || x.owner)
      .map(x => ({ n: x.name, i: x.id, a: x.icon }))
  }

  /**
   * Fetches user of whom bearer belongs to
   * @param {String} bearer User Bearer
   * @returns {Object} User Object
   */
  async _user (bearer) {
    const user = await this.api
      .users['@me']
      .get({
        headers: {
          Authorization: `Bearer ${bearer}`
        }
      })

    if (!user || !user.id) return

    return user
  }

  /**
   * Fetch bearer from oauth code
   * @param {String} code Code received from oauth transaction
   * @returns {Object} OAuth User
   */
  async _bearer (code) {
    const user = await this.api
      .oauth2
      .token
      .post({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: {
          client_id: this.config.oauth.id,
          client_secret: this.config.oauth.secret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.manager.redirect,
          scope: 'identify guilds'
        },
        parser: encodeJSON
      })
    if (!user || !user.access_token) return false

    return user
  }
}

module.exports = OAuth2
