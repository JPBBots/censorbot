module.exports = function (r) {
  r.get('/', async (req, res) => {
    res.json(await this.sendToAll(
      'GUILD_COUNT',
      {},
      true
    ))
  })

  r.get('/:guildid', async (req, res) => {
    const cluster = this.guildCluster(req.params.guildid)
    if (!cluster) return res.json({})
    res.json(await cluster.send('GUILD_FETCH', { id: req.params.guildid }, true))
  })
}
