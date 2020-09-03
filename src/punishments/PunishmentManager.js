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
  constructor (cluster) {
    this.cluster = cluster

    this.config = config

    this.app = new PunishmentApp(this)
    this.timeouts = new TimeoutManager(this)

    this.database = null

    this.rest = new RestManager(config.token)

    this.logger = new Logger('PUNISH')
  }

  log (..._) {
    this.logger.log(..._)
  }

  get api () {
    return this.rest.builder()
  }

  get db () {
    return this.database.collection('punish')
  }

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

  async kick (guild, user, db) {
    await this.api
      .guilds[guild]
      .members[user]
      .delete({
        reason: 'Reached max warnings.'
      })

    await this.sendLog(false, db, user, 'Kicked')
  }

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

  async unban (guild, user, db) {
    await this.api
      .guilds[guild]
      .bans[user]
      .delete({
        reason: 'Auto-unbanned after time.'
      })

    await this.sendLog(true, db, user, 'Unbanned', `After ${db.punishment.time / 60000} minutes`)
  }

  async punish (guild, user, db) {
    if (db.punishment.type === 0) return

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
