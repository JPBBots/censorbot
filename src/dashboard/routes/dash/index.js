const Express = require('express')
const { resolve } = require('path')

module.exports = function (r) {
  r.get('/', async (req, res) => {
    if (!req.cookies.token) return res.render('errors/gotologin', { link: this.oauthLogin() })

    const guilds = await this.getGuilds(req)

    if (!guilds) return

    res.render('guilds', { guilds: guilds, token: req.cookies.token, base: this.base })
  })

  r.use('/static', Express.static(resolve(__dirname, '../../static')))

  r.get(/\/premium(.json|)/, this.premiumMiddle(false, (req, res, user, premium, guilds) => {
    if (req.url.endsWith('.json')) return res.json({ premium, guilds })
    res.render('premium', { base: this.base, api: this.apiUrl, premium, guilds, token: user.token })
  }))

  r.get('/admin', this.adminMiddle(false, async (req, res) => {
    res.render('admin', { token: req.cookies.token, shards: await this.client.cluster.internal.shardStats().then(a=>a.map(b=>b.shards)) })
  }))

  r.use('/:serverid', this.getGuild(false))

  r.get('/:serverid', this.guildData(false, async (req, res, data) => {
    delete data.db.id
    res.render(req.query.d ? 'devguild' : 'guild', { data, base: this.base, api: this.apiUrl, token: req.cookies.token, premium: await this.client.db.guildPremium(data.id), dev: req.query.d })
  }))

  r.get('/:serverid/logs', async (req, res) => {
    const logs = await this.client.db.collection('log').findOne({ id: req.partialGuild.i })

    res.render('logs', { logs: logs ? logs.logs : [], base: this.base })
  })
}
