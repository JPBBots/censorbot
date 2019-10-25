module.exports = class guildDB {
  constructor (guild, db) {
    this.guild = guild
    this.db = db
  }

  async getAll () {
    return await this.db.getAll(this.guild.id)
  }

  async get (row) {
    return await this.db.get(this.guild.id, row)
  }

  async update (obj) {
    return await this.db.update(this.guild.id, obj)
  }

  async set (place, value) {
    return await this.db.set(this.guild.id, place, value)
  }
}
