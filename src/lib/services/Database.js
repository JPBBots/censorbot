const { MongoClient } = require('mongodb')
delete require.cache[require.resolve('../client/DefaultConfig')]

class Database {
  /**
   * Database
   * @param {Client} client Client
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

    /**
     * Default guild config
     * @type {Object}
     */
    this.defaultConfig = require('../client/DefaultConfig')

    if (db) {
      this.db = db
      this.mongo = mongo
      this.client.log(0, 11, 'Database')
    } else this.mongo = new MongoClient(`mongodb://${username}:${password}@localhost:27017/`, { useNewUrlParser: true, useUnifiedTopology: true })
  }

  async connect () {
    this.client.log(0, 0, 'Database')
    const start = new Date().getTime()
    await this.mongo.connect()

    /**
     * Database
     * @type {MongoDatabase}
     */
    this.db = await this.mongo.db('censorbot')

    this.client.log(0, 1, 'Database', `${new Date().getTime() - start}ms`)
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

    return config
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
        ...obj
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
