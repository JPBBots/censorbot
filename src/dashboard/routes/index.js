const encodeJSON = require('../../../util/encodeJSON')

module.exports = function (r) {
  r.get('/invite', (req, res) => {
    res.redirect('https://discordapp.com/oauth2/authorize?' +
      encodeJSON({
        client_id: this.config.id,
        permissions: '8',
        scope: 'bot',
        guild_id: req.query.id || ''
      })
    )
  })

  r.get('/updates.json', (req, res) => {
    res.json(this.updates.list())
  })

  r.get('/updates', (req, res) => {
    res.render('updates', { updates: this.updates.list() })
  })

  r.get('/updates/:v.json', (req, res) => {
    res.json(this.updates.getUpdate(req.params.v))
  })

  r.get('/updates/:v', (req, res) => {
    const update = this.updates.getUpdate(req.params.v, true)
    if (!update) return res.redirect('/updates')
    res.render('update', { update })
  })
}
