const Collection = require('../util/Collection')

const { unpunishmentTypes } = require('./punishmentTypes')

/**
 * @typedef {Object} Timeout Unmute Database Object
 * @property {Snowflake} user ID of user
 * @property {Snowflake} guild ID of guild
 * @property {Number} at Millisecond time to remove mute
 */

class TimeoutManager {
  constructor (manager) {
    this.manager = manager

    this.intervals = new Collection()
  }

  get db () {
    return this.manager.database.collection('timeouts')
  }

  async execTimeout (guild, user, type) {
    this.intervals.set(`${user};${guild}`, true)

    const db = await this.manager.database.config(guild)

    if (db.punishment.type === 0) return

    await this.manager[unpunishmentTypes[type]](guild, user, db)

    await this.db.removeOne({ guild, user })

    this.intervals.delete(`${user};${guild}`)
  }

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
