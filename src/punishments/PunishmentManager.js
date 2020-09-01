const Database = require('../services/Database')

const config = require('../config')

const PunishmentApp = require('./PunishmentApp')
const UnmuteManager = require('./UnmuteManager')

const RestManager = require('../discord/rest/RestManager')
const Embed = require('../discord/Embed')

const Logger = require('../util/Logger')

/**
 * Used to decide which kind of punishment to execute in a given server
 * @typedef {Number} PunishmentType
 * @example
 * 0: Off
 * 1: Mute
 * 2: Kick
 * 3: Ban
 */

const punishmentTypes = {
  1: 'mute',
  2: 'kick',
  3: 'ban'
}

/**
 * @typedef {Object} Punishment Punishment Database Object
 * @property {Snowflake} guild Guild ID
 * @property {Snowflake} user User ID
 * @property {Number} warnings Warning count
 * @example
 * {
 *  guild: '399688888739692552',
 *  user: '142408079177285632',
 *  warnings: 2
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
    this.unmutes = new UnmuteManager(this)

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

    this.unmutes.checkUnmutes()

    setInterval(() => {
      this.unmutes.checkUnmutes()
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
        reason: `Reached max warnings${db.punishment.time ? `. Unmuted in ${db.punishment.time.toLocaleString()} minutes.` : ''}`
      })

    await this.sendLog(false, db, user, 'Muted', `Received <@&${db.punishment.role}>${db.punishment.time ? `\nWill be unmuted in ${db.punishment.time.toLocaleString()} minutes` : ''}`)

    if (db.punishment.time) {
      await this.unmutes.db.updateOne({
        guild, user
      }, {
        $set: {
          guild,
          user,
          at: Date.now() + (db.punishment.time * 1000)
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

    await this.sendLog(true, db, user, 'Unmuted', `After ${db.punishment.time} minutes`)
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

    await this.sendLog(false, db, user, 'Banned')
  }

  async punish (guild, user, db) {
    if (db.punishment.type === 0) return

    let punish = await this.db.findOne({ guild, user })

    if (!punish) {
      punish = {
        guild, user, warnings: 0
      }
    }

    punish.warnings++

    if (punish.warnings >= db.punishment.amount) {
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
