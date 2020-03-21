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

  r.get('/admin', this.adminMiddle(false, (req, res) => {
    res.render('admin', { token: req.cookies.token })
  }))

  r.use('/:serverid', this.getGuild(false))

  r.get('/:serverid', this.guildData(false, async (req, res, data) => {
    res.render(req.query.d ? 'devguild' : 'guild', { data, base: this.base, api: this.apiUrl, token: req.cookies.token, premium: await this.client.db.guildPremium(data.id), dev: req.query.d })
  }))
}
