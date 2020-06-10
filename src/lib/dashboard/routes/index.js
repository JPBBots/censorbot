module.exports = function (r) {
  r.use('/(:guildid)?', async (req, res, next) => {
    req.api = req.url.endsWith('.json') || req.method !== 'GET'

    let results
    if (req.cookies.token) results = await this.oauth2.getGuilds(req.cookies.token)

    if (!results) return req.api ? res.status(401).json({ error: 'Unauthorized' }) : res.render('login', { login: this.login(req.params.guildid) })

    req.user = results.user
    req.guilds = results.guilds

    next()
  })

  r.get('/error', (req, res) => {
    res.status(200).render('error', {
      happening: 'Thinking about things.',
      error: 'Think not defined',
      tryAgain: '/error',
      isAdmin: req.user.admin
    })
  })

  r.get('/logoutTest', (req, res) => {
    res.status(200).render('logout', {
      isAdmin: false,
      noSidebar: true
    })
  })

  r.get('/(.json)?', (req, res) => {
    if (req.api) return res.status(200).json(req.guilds)

    res.status(200).render('guilds', { guilds: req.guilds, goTo: this.guildPage.bind(this), isAdmin: req.user.admin })
  })

  r.use('/(:guildid)(.json)?', async (req, res, next) => {
    if (!req.params.guildid.match(/[0-9]{15,17}/)) return next()

    const guild = req.guilds.find(x => x.i === req.params.guildid)
    if (!guild && !req.user.admin) return req.api ? res.status(403).json({ error: 'Not allowed to edit guild' }) : res.render('error', { happening: 'accessing server', isAdmin: false, tryAgain: this.login(req.params.guildid), error: 'You don\'t have permission to edit this server' })

    req.guild = await this.cluster.internal.fetchGuild(req.params.guildid)
    if (!req.guild) return req.api ? res.status(404).json({ error: 'Not In Guild' }) : res.render('invite', { invite: this.invite(req.params.guildid), isAdmin: req.user.admin })

    next()
  })

  r.get('/(:guildid)(.json)?', async (req, res, next) => {
    if (!req.params.guildid.match(/[0-9]{15,17}/)) return next()

    const db = await this.db.config(req.guild.i)
    const premium = await this.db.guildPremium(req.guild.i)

    const data = { guild: req.guild, db, premium, isAdmin: req.user.admin }

    if (req.api) return res.status(200).json(data)

    res.status(200).render('guild', data)
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
