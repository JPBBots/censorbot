const allowedGuilds = global.botIsCustom
  ? process.env.ALLOWED_GUILDS.split(',')
  : false

module.exports = async function () {
  this.log('All shards on cluster ready')

  if (allowedGuilds) {
    const notAllowedGuilds = this.guilds.filter(x => !allowedGuilds.includes(x.id)).map(x => x.id)

    for (let i = 0; i < notAllowedGuilds.length; i++) {
      await this.interface.leaveGuild(notAllowedGuilds[i])
      this.log(`Tried to join ${notAllowedGuilds[i]}, but not allowed.`)
    }
  }
}
