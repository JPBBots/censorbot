// Punishments manager

class PunishmentsHandler {
  constructor(client, db) {
    this.client = client
    this.db = db
  }

  async punish(guild, user, db, warning, inDB) {
    if (inDB) await this.db.removeOne({
      u: user,
      g: guild
    })

    const log = this.client.channels.get(db.log)

    if (!log) return

    const embed = this.client.u.embed
      .setTitle('User Punished')
      .setColor('RED')
      .setFooter('This system is heavily WIP!')
      
    let cont = true

    switch (db.punishment.type) {
      case 1:
        if (!await this.client.api
          .guilds[guild]
          .members[user]
          .roles[db.punishment.role]
          .put()
          .catch(() => {})
        ) cont = false
        embed.setDescription(`<@${user}> Reached the max ${db.punishment.amount} warnings.\n\nThey have received the <@&${db.punishment.role}> role as punishment!`)
        break
      case 2:
        if (!await this.client.api
          .guilds[guild]
          .members[user]
          .delete({
            reason: 'Reaching max warnings'
          })
        ) cont = false
        embed.setDescription(`<@${user}> Reached the max ${db.punishment.amount} warnings.\n\nThey have been kicked from the server!`)
        break
      case 3:
        if (!await this.client.api
          .guilds[guild]
          .bans[user]
          .put({
            query: {
              reason: 'Reached max warnings'
            }
          })
        ) cont = false
        embed.setDescription(`<@${user}> Reached the max ${db.punishment.amount} warnings.\n\nThey have been banned from the server!`)
        break
    }
  
    if (!cont) return
    
    log.send(embed)
  }

  async addOne(guild, user, db) {
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
      }
    else {
      this.db.updateOne({
        g: guild,
        u: user
      }, { $set: puser }, {
        upsert: true
      })
    }
  }
}

module.exports = PunishmentsHandler


/**
 * 0: none
 * 1: mute
 * 2: kick
 * 3: ban
 */
