// Punishments manager

class PunishmentsHandler {
  constructor(client, db) {
    this.client = client
    this.db = db
  }

  async punish(guild, user, db, warning, inDB) {
    const res = await this.client.api
      .guilds[guild]
      .members[user]
      .roles[db.punishment.role]
      .put()
      .catch(()=>{})

    if (inDB) await this.db.removeOne({
      u: user,
      g: guild
    })

    if (!res) return

    const log = this.client.channels.get(db.log)

    if (log) log.send(this.client.u.embed
      .setTitle('User Punished')
      .setDescription(`<@${user}> Reached the max ${db.punishment.amount} warnings.\n\nThey have received the <@&${db.punishment.role}> role as punishment!`)
      .setColor('RED')
      .setFooter('This system is heavily WIP!')
    )
  }

  async addOne(guild, user, db) {
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
