const Database = require('../services/Database')

const config = require('../config')

const PunishmentApp = require('./PunishmentApp')
const TimeoutManager = require('./TimeoutManager')

const RestManager = require('../discord/rest/RestManager')
const Embed = require('../discord/Embed')

const Logger = require('../util/Logger')

const { punishmentTypes } = require('./punishmentTypes')

/**
 * @typedef {Object} Punishment Punishment Database Object
 * @property {Snowflake} guild Guild ID
 * @property {Snowflake} user User ID
 * @property {Array.<Number>} warnings Array of dates when said warning expires
 * @example
 * {
 *  guild: '399688888739692552',
 *  user: '142408079177285632',
 *  warnings: [
 *    1599080523732,
 *    1599080513732
 *  ]
 * }
 */

/**
 * Punishment Manager
 */
class PunishmentManager {
  /**
   * Punishment Manager
   * @param {Worker} cluster Cluster Worker
   */
  constructor (cluster) {
    /**
     * Cluster Worker
     * @type {Worker}
     */
    this.cluster = cluster

    /**
     * Config
     * @type {Object}
     */
    this.config = config

    /**
     * HTTP App
     * @type {PunishmentApp}
     */
    this.app = new PunishmentApp(this)
    /**
     * Timeout Manager
     * @type {TimeoutManager}
     */
    this.timeouts = new TimeoutManager(this)

    /**
     * Database
     * @type {Database}
     */
    this.database = null

    /**
     * Discord Rest
     * @type {RestManager}
     */
    this.rest = new RestManager(config.token)

    /**
     * Logging
     * @type {Logger}
     */
    this.logger = new Logger('PUNISH')
  }

  /**
   * Log
   * @param  {...any} _ Log Data
   */
  log (..._) {
    this.logger.log(..._)
  }

  /**
   * API route
   * @type {Router}
   */
  get api () {
    return this.rest.builder()
  }

  /**
   * Punishment database
   * @type {MongoCollection}
   */
  get db () {
    return this.database.collection('punish')
  }

  /**
   * Start punishment manager
   * @async
   */
  async start () {
    this.database = new Database(null, config.db.username, config.db.password)

    await this.database.connect()

    await this.app.setup()

    this.timeouts.checkTimeouts()

    setInterval(() => {
      this.timeouts.checkTimeouts()
    }, 60000)

    this.log('Started')
  }

  /**
   * Send a log to the guilds log channel about a punishment
   * @param {Boolean} positive Whether or not the punishment is positive
   * @param {Object} db Guild database objecy
   * @param {Snowflake} user User ID
   * @param {String} type Type of punishment
   * @param {?String} description Extra description
   */
  async sendLog (positive, db, user, type, description) {
    if (!db.log) return
    await this.api
      .channels[db.log]
      .messages
      .post({
        body: {
          embed: new Embed()
            .color(positive ? 'GREEN' : 'RED')
            .title(`User ${type}`)
            .description(`<@${user}> ${positive ? '' : `reached ${db.punishment.amount} warnings.`}${description ? `\n\n${description}` : ''}`)
            .timestamp()
            .render()
        }
      })
  }

  /**
   * Mute a user
   * @param {Snowflake} guild Guild ID
   * @param {Snowflake} user User ID
   * @param {Object} db Guild DB
   */
  async mute (guild, user, db) {
    await this.api
      .guilds[guild]
      .members[user]
      .roles[db.punishment.role]
      .put({
        reason: `Reached max warnings${db.punishment.time ? `. Unmuted in ${(db.punishment.time / 60000).toLocaleString()} minutes.` : ''}`
      })

    await this.sendLog(false, db, user, 'Muted', `Received <@&${db.punishment.role}>${db.punishment.time ? `\nWill be unmuted in ${(db.punishment.time / 60000).toLocaleString()} minutes` : ''}`)

    if (db.punishment.time) {
      await this.timeouts.db.updateOne({
        guild, user
      }, {
        $set: {
          guild,
          user,
          type: 1,
          at: Date.now() + db.punishment.time
        }
      }, {
        upsert: true
      })
    }
  }

  /**
   * Unmute a user
   * @param {Snowflake} guild Guild ID
   * @param {Snowflake} user User ID
   * @param {Object} db Guild DB
   */
  async unmute (guild, user, db) {
    await this.api
      .guilds[guild]
      .members[user]
      .roles[db.punishment.role]
      .delete({
        reason: 'Auto-unmuted after time.'
      })

    await this.sendLog(true, db, user, 'Unmuted', `After ${db.punishment.time / 60000} minutes`)
  }

  /**
   * Kick a user
   * @param {Snowflake} guild Guild ID
   * @param {Snowflake} user User ID
   * @param {Object} db Guild DB
   */
  async kick (guild, user, db) {
    await this.api
      .guilds[guild]
      .members[user]
      .delete({
        reason: 'Reached max warnings.'
      })

    await this.sendLog(false, db, user, 'Kicked')
  }

  /**
   * Ban a user
   * @param {Snowflake} guild Guild ID
   * @param {Snowflake} user User ID
   * @param {Object} db Guild DB
   */
  async ban (guild, user, db) {
    await this.api
      .guilds[guild]
      .bans[user]
      .put({
        reason: 'Reached max warnings.'
      })

    await this.sendLog(false, db, user, 'Banned', db.punishment.time ? `Will be unbanned in ${(db.punishment.time / 60000).toLocaleString()} minutes` : '')

    if (db.punishment.time) {
      await this.timeouts.db.updateOne({
        guild, user
      }, {
        $set: {
          guild,
          user,
          type: 3,
          at: Date.now() + db.punishment.time
        }
      }, {
        upsert: true
      })
    }
  }

  /**
   * Unban a user
   * @param {Snowflake} guild Guild ID
   * @param {Snowflake} user User ID
   * @param {Object} db Guild DB
   */
  async unban (guild, user, db) {
    await this.api
      .guilds[guild]
      .bans[user]
      .delete({
        reason: 'Auto-unbanned after time.'
      })

    await this.sendLog(true, db, user, 'Unbanned', `After ${db.punishment.time / 60000} minutes`)
  }

  /**
   * Punish a user in-stack
   * @param {Snowflake} guild Guild ID
   * @param {Snowflake} user User ID
   * @param {Object} db Guild DB
   */
  async punish (guild, user, db) {
    if (!db.punishment.type) return

    let punish = await this.db.findOne({ guild, user })

    if (!punish) {
      punish = {
        guild, user, warnings: []
      }
    }

    punish.warnings.push(db.punishment.expires ? Date.now() + db.punishment.expires : Infinity)

    punish.warnings = punish.warnings.filter(x => Date.now() < x)

    if (punish.warnings.length >= db.punishment.amount) {
      await this[punishmentTypes[db.punishment.type]](guild, user, db)

      await this.db.removeOne({ guild, user })
    } else {
      await this.db.updateOne({
        guild, user
      }, {
        $set: punish
      }, {
        upsert: true
      })
    }
  }
}

module.exports = PunishmentManager
