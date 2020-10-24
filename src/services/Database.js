const { MongoClient } = require('mongodb')
delete require.cache[require.resolve('../client/Config')]

const { db: { host } } = require('../settings')

const Cache = require('../util/Cache')

/**
 * Used for connecting to mongo database and built methods
 */
class Database {
  /**
   * Database
   * @param {Dashboard} client Client
   * @param {String} username Username
   * @param {String} password Password
   * @param {?MongoDatabase} db Database if reloading
   * @param {?MongoClient} mongo Mongo if reloading
   */
  constructor (client, username, password, db, mongo) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client

    this.Config = require('../client/Config')

    if (db) {
      this.db = db
      this.mongo = mongo
    } else this.mongo = new MongoClient(`mongodb://${username}:${password}@${host}:27017/`, { useNewUrlParser: true, useUnifiedTopology: true })

    this.configCache = new Cache(300000)

    if (this.client && this.client.cluster) {
      this.client.cluster.on('GUILD_DUMP', (data) => {
        this.configCache.delete(data.id)
      })
    }
  }

  /**
   * Default guild config
   * @type {Object}
   */
  get defaultConfig () {
    return this.Config.config
  }

  /**
   * Guild config constants
   * @type {Object}
   */
  get constants () {
    return this.Config.constants
  }

  /**
   * Connect the database
   */
  async connect () {
    await this.mongo.connect()

    /**
     * Database
     * @type {MongoDatabase}
     */
    this.db = await this.mongo.db('censorbot')
  }

  /**
   * Cursors to collection
   * @param {String} collection Collection to cursor to
   * @return {MongoCollection}
   */
  collection (..._) { return this.db.collection(..._) }

  /**
   * Gets guild config
   * @param {Snowflake} id Guild
   * @param {Boolean} allowRewrite Allows for config to rewrite if not exist
   * @returns {Promise.<Object>} Config
   */
  async config (id, allowRewrite = true) {
    const cached = this.configCache.get(id)
    if (cached) return cached

    let config = await this.collection('guild_data')
      .findOne({
        id: id
      })

    if (!config && allowRewrite) {
      config = {
        id,
        ...this.defaultConfig
      }
      await this.collection('guild_data')
        .insertOne(config)
    }

    delete config._id

    if (config.v !== this.constants.currentVersion) config = this.outdate(config)

    delete config.v

    this.configCache.set(id, config)

    return config
  }

  outdate (obj) {
    const newObj = { ...obj }
    switch (obj.v) {
      case 1:
        newObj.webhook = {
          enabled: obj.webhook,
          replace: obj.webhook_replace,
          separate: obj.webhook_separate
        }
        newObj.msg = {
          content: obj.msg,
          deleteAfter: obj.pop_delete
        }
        delete newObj.webhook_replace
        delete newObj.webhook_separate
        delete newObj.pop_delete

        // falls through
      case 2:
        newObj.invites = false

        // falls through
      case 3:
        if (!obj.base) newObj.filters = []
        else newObj.filters = obj.languages

        delete newObj.base
        delete newObj.languages

        // falls through
      case 4:
        newObj.fonts = false

        // falls through
      case 5:
        newObj.punishment.time = null
        newObj.punishment.expires = null

        // falls through
      case 6:
        newObj.nsfw = true

        // falls through
      case 7:
        newObj.dm = false
        break
      default:
        break
    }

    newObj.v = this.constants.currentVersion

    this.setConfig(obj.id, newObj, true)

    return newObj
  }

  /**
   * Sets guild config
   * @param {Snowflake} id Guild
   * @param {Object} obj Object to set
   * @param {Boolean} [replace=false] Whether to replace
   * @returns {Promise.<Object>} Mongo response
   */
  async setConfig (id, obj, replace = false) {
    this.client.cluster.internal.dumpGuild(id)
    const filled = {
      $set: {
        id,
        ...obj,
        v: this.constants.currentVersion
      }
    }

    let res

    if (replace) res = await this.collection('guild_data').replaceOne({ id }, filled, { upsert: true })
    else res = await this.collection('guild_data').updateOne({ id }, filled, { upsert: true })

    if (!res || res.n < 1) throw new Error('DB Error')
    return true
  }

  /**
   * If guild is premium
   * @param {Snowflake} id Guild
   * @returns {Boolean}
   */
  async guildPremium (id) {
    const response = await this.collection('premium_users').find({
      guilds: {
        $elemMatch: { $eq: id }
      }
    }).toArray()
      .then(x => x.length)

    return response > 0
  }
}

module.exports = Database
