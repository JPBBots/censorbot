module.exports = function (r) {
  r.put('/', (req, res) => {
    this.currents.GUILD_COUNT++
    this.gauge('guilds.count', this.currents.GUILD_COUNT, [], Date.now())

    res.json({ success: true })
  })
  r.delete('/', (req, res) => {
    this.currents.GUILD_COUNT--
    this.gauge('guilds.count', this.currents.GUILD_COUNT, [], Date.now())

    res.json({ success: true })
  })
}
