const Collection = require('../util/Collection')

/**
 * @typedef {Object} Unmute Unmute Database Object
 * @property {Snowflake} user ID of user
 * @property {Snowflake} guild ID of guild
 * @property {Number} at Millisecond time to remove mute
 */

class UnmuteManager {
  constructor (manager) {
    this.manager = manager

    this.intervals = new Collection()
  }

  get db () {
    return this.manager.database.collection('unmutes')
  }

  async execUnmute (guild, user) {
    this.intervals.set(`${user};${guild}`, true)

    const db = await this.manager.database.config(guild)

    if (db.punishment.type === 0) return

    await this.manager.unmute(guild, user, db)

    await this.db.removeOne({ guild, user })

    this.intervals.delete(`${user};${guild}`)
  }

  async checkUnmutes () {
    const unmutes = await this.db.find({ at: { $lt: Date.now() + 300000 } }).toArray()

    unmutes
      .filter(x => !this.intervals.has(`${x.user};${x.guild}`))
      .forEach(unmute => {
        if (unmute.at < Date.now()) return this.execUnmute(unmute.guild, unmute.user)
        this.intervals.set(`${unmute.user};${unmute.guild}`,
          setInterval(() => {
            this.execUnmute(unmute.guild, unmute.user)
          }, unmute.at - Date.now())
        )
      })
  }
}

module.exports = UnmuteManager
