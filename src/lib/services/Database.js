const { MongoClient } = require('mongodb')
delete require.cache[require.resolve('../client/Config')]

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
    } else this.mongo = new MongoClient(`mongodb://${username}:${password}@localhost:27017/`, { useNewUrlParser: true, useUnifiedTopology: true })
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
        break
      default:
        break
    }

    newObj.v = this.constants.currentVersion

    this.collection('guild_data').replaceOne({ id: obj.id }, newObj)

    return newObj
  }

  /**
   * Sets guild config
   * @param {Snowflake} id Guild
   * @param {Object} obj Object to set
   * @returns {Promise.<Object>} Mongo response
   */
  async setConfig (id, obj) {
    const res = await this.collection('guild_data').updateOne({ id }, {
      $set: {
        id,
        ...obj,
        v: this.constants.currentVersion
      }
    }, { upsert: true })

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
