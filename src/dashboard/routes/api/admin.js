module.exports = function (r) {
  r.use(this.adminMiddle(true))

  r.get('/users/:userid', (req, res) => {
    const guilds = this.client.userGuilds.get(req.params.userid) || []

    res.json(
      this.client.guilds.filter(x => guilds.includes(x.id)).map(x => {
        return {
          id: x.id,
          name: x.name
        }
      })
    )
  })

  r.post('/shards/:shardid', (req, res) => {
    this.client.cluster.internal.restart(parseInt(req.params.shardid), req.body.destroy)
    res.json({ success: true })
  })

  r.post('/clusters/:clusterid', (req, res) => {
    this.client.cluster.internal.killCluster(parseInt(req.params.clusterid))
  })

  r.get('/guilds/:guildid', async (req, res) => {
    const config = await this.client.db.config(req.params.guildid, false)
    if (!config) return res.json({ error: 'No Config' })

    res.json(config)
  })

  r.put('/guilds/:guildid', async (req, res) => {
    await this.client.db.setConfig(req.params.guildid, this.client.db.defaultConfig)
    res.json({
      success: true
    })
  })

  r.delete('/guilds/:guildid', async (req, res) => {
    await this.client.interface.leaveGuild(req.params.guildid)
    res.json({
      success: true
    })
  })

  r.post('/eval', async (req, res) => {
    if (req.user.id !== this.client.config.owner) return res.json({ evaled: 'Not Authorized' })
    const client = this.client // eslint-disable-line no-unused-vars
    try {
      const code = req.body.eval.replace(/(‘|’)/g, "'").replace(/(“|”)/g, '"')
      let evaled = eval(code) // eslint-disable-line no-eval
      if (evaled && evaled.then) evaled = await evaled

      if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled) }

      res.json({ evaled })
    } catch (err) {
      res.json({
        evaled: `${err.message}`
      })
    }
  })
}
