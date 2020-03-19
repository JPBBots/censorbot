const encodeJSON = require('../../../util/encodeJSON')

module.exports = function (r) {
  r.get('/invite', (req, res) => {
    res.redirect('https://discordapp.com/oauth2/authorize?' +
      encodeJSON({
        client_id: this.client.config.id,
        permissions: '8',
        scope: 'bot',
        guild_id: req.query.id || ''
      })
    )
  })
}
