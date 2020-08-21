/**
 * Used to decide which kind of punishment to execute in a given server
 * @typedef {Number} PunishmentType
 * @example
 * 0: Mute
 * 1: Kick
 * 2: Ban
 */

/**
 * Used for managing warnings and distributing punishments
 */
class Punishments {
  /**
   * Punishments Manager
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client
  }

  /**
   * Database
   * @type {MongoDB.Collection}
   */
  get db () {
    return this.client.db.collection('punishments')
  }

  /**
   * Punishes a user
   * @param {Snowflake} guild Guild
   * @param {Snowflake} user User
   * @param {Object} db Database
   * @param {Number} warning Warning amount
   * @param {Boolean} inDB In Database
   */
  async punish (guild, user, db, warning, inDB) {
    if (inDB) {
      await this.db.removeOne({
        u: user,
        g: guild
      })
    }

    if (!db.log) return

    const embed = this.client.embed
      .title('User Punished')
      .color('RED')
      .footer('This system is heavily WIP!')

    let cont = true

    switch (db.punishment.type) {
      case 1:
        if (!await this.client.interface.addRole(guild, user, db.punishment.role, 'Reached Max Warnings')
          .then(x => x.success)
        ) cont = false
        embed.description(`<@${user}> Reached the max ${db.punishment.amount} warnings.\n\nThey have received the <@&${db.punishment.role}> role as punishment!`)
        break
      case 2:
        if (!await this.client.interface.kick(guild, user, 'Reached Max Warnings')
          .then(x => x.success)
        ) cont = false
        embed.description(`<@${user}> Reached the max ${db.punishment.amount} warnings.\n\nThey have been kicked from the server!`)
        break
      case 3:
        if (!await this.client.interface.ban(guild, user, 'Reached Max Warnings')
          .then(x => x.success)
        ) cont = false
        embed.description(`<@${user}> Reached the max ${db.punishment.amount} warnings.\n\nThey have been banned from the server!`)
        break
    }

    if (!cont) return

    this.client.interface.send(db.log, embed)
  }

  /**
   * Adds a user punishment
   * @param {Snowflake} guild Guild
   * @param {Snowflake} user User
   * @param {Object} db Database
   */
  async addOne (guild, user, db) {
    if (db.punishment.type === 0) return
    let inDB = true
    let puser = await this.db.findOne({
      u: user,
      g: guild
    })
    if (!puser) {
      inDB = false
      puser = {
        u: user,
        g: guild,
        a: 0
      }
    }
    puser.a++
    if (puser.a >= db.punishment.amount) {
      this.punish(guild, user, db, puser.a, inDB)
    } else {
      this.db.updateOne({
        g: guild,
        u: user
      }, { $set: puser }, {
        upsert: true
      })
    }
  }
}

module.exports = Punishments

/**
 * 0: none
 * 1: mute
 * 2: kick
 * 3: ban
 */
