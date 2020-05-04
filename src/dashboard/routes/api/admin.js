module.exports = function (r) {
  r.use(this.adminMiddle(true))

  r.post('/shards/:shardid', (req, res) => {
    this.cluster.restart(parseInt(req.params.shardid), req.body.destroy)
    res.json({ success: true })
  })

  r.post('/clusters/:clusterid', (req, res) => {
    this.cluster.killCluster(parseInt(req.params.clusterid))
  })

  r.get('/guilds/:guildid', async (req, res) => {
    const config = await this.database.config(req.params.guildid, false)
    if (!config) return res.json({ error: 'No Config' })

    res.json(config)
  })

  r.put('/guilds/:guildid', async (req, res) => {
    await this.database.setConfig(req.params.guildid, this.database.defaultConfig)
    res.json({
      success: true
    })
  })

  // r.delete('/guilds/:guildid', async (req, res) => {
  //   await this.client.interface.leaveGuild(req.params.guildid)
  //   res.json({
  //     success: true
  //   })
  // })
}
