const encodeJSON = require('../../util/encodeJSON')

module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.get('/invite', (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?${encodeJSON({
      client_id: this.config.id,
      permissions: 8, // admin
      scope: 'bot',
      guild_id: req.query.id || null
    })}`)
  })
}
