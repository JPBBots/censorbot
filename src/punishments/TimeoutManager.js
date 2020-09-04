const Collection = require('../util/Collection')

const { unpunishmentTypes } = require('./punishmentTypes')

/**
 * @typedef {Object} Timeout Unmute Database Object
 * @property {Snowflake} user ID of user
 * @property {Snowflake} guild ID of guild
 * @property {Number} at Millisecond time to remove mute
 */

/**
 * Manage unmutes/unbans on timers
 */
class TimeoutManager {
  /**
   * Timeout Manager
   * @param {PunishmentManager} manager Manager
   */
  constructor (manager) {
    /**
     * Manager
     * @type {PunishmentManager}
     */
    this.manager = manager

    /**
     * Intervals til unpunish
     * @type {Collection.<Snowflake, Timeout>}
     */
    this.intervals = new Collection()
  }

  /**
   * Timeout Database
   * @type {MongoCollection}
   */
  get db () {
    return this.manager.database.collection('timeouts')
  }

  /**
   * Execute on a timeout to unpunish someone
   * @param {Snowflake} guild Guild ID
   * @param {Snowflake} user User ID
   * @param {PunishmentType} type Type of punishment
   * @async
   */
  async execTimeout (guild, user, type) {
    this.intervals.set(`${user};${guild}`, true)

    const db = await this.manager.database.config(guild)

    if (db.punishment.type === 0) return

    await this.manager[unpunishmentTypes[type]](guild, user, db)

    await this.db.removeOne({ guild, user })

    this.intervals.delete(`${user};${guild}`)
  }

  /**
   * Check timeouts in the database and load them into intervals
   * @async
   */
  async checkTimeouts () {
    const timeouts = await this.db.find({ at: { $lt: Date.now() + 300000 } }).toArray()

    timeouts
      .filter(x => !this.intervals.has(`${x.user};${x.guild}`))
      .forEach(timeout => {
        this.intervals.set(`${timeout.user};${timeout.guild}`,
          setTimeout(() => {
            this.execTimeout(timeout.guild, timeout.user, timeout.type)
          }, timeout.at - Date.now())
        )
      })
  }
}

module.exports = TimeoutManager
