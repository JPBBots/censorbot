module.exports = function (r) {
  r.use('/(:guildid)?(.json)?', async (req, res, next) => {
    let results
    if (req.cookies.token) results = await this.oauth2.getGuilds(req.cookies.token)

    if (!results) return res.status(401).json({ error: 'Unauthorized' })

    req.user = results.user
    req.guilds = results.guilds

    next()
  })

  r.get('/', (req, res) => {
    res.status(200).json(req.guilds)
  })

  r.use('/:guildid', async (req, res, next) => {
    if (!req.params.guildid.match(/[0-9]{15,17}/)) return next()

    const guild = req.guilds.find(x => x.i === req.params.guildid)
    if (!guild && !req.user.admin) return res.status(403).json({ error: 'Not allowed to edit guild' })

    req.guild = await this.cluster.internal.fetchGuild(req.params.guildid)
    if (!req.guild) return res.status(404).json({ error: 'Not In Guild' })

    next()
  })

  r.get('/:guildid', async (req, res, next) => {
    if (!req.params.guildid.match(/[0-9]{15,17}/)) return next()

    const db = await this.db.config(req.guild.i)
    const premium = await this.db.guildPremium(req.guild.i)

    res.status(200).json({ guild: req.guild, db, premium })
  })

  r.post('/(:guildid)(.json)?', async (req, res, next) => {
    if (!req.params.guildid.match(/[0-9]{15,17}/)) return next()

    const premium = await this.db.guildPremium(req.guild.i)

    const settings = this.db.Config.verify(req.body, premium, req.guild)

    this.db.setConfig(req.guild.i, settings)
      .then(_ => {
        res.status(200).json(settings)
      })
      .catch(err => {
        res.status(500).json({ error: err.message })
      })
  })
}
