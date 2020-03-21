const encodeJSON = require('../../../util/encodeJSON')
const Express = require('express')

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

  r.get('/updates/:v', (req, res, next) => {
    var url = 'https://censorbot.jt3ch.net/updates'
    var z = require('/home/jpb/websites/censorbot/updates/updates.js')
    var the = z.find((x) => x.v == req.params.v)
    if (!the) return next()
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
          <meta property="og:title" content="Update v${the.v}">
          <meta property="og:url" content="https://censorbot.jt3ch.net/updates/${req.params.v}">
          <meta property="og:description" content="${the.desc}">
      </head>
      <body>
          <h1>${req.params.v}</h1>
      </body>
      <script>
          window.location.replace("${url}#${req.params.v}");
      </script>
    </html>`)
  })

  r.get('/updates', (req, res) => {
    res.sendFile('/home/jpb/websites/censorbot/updates/index.html')
  })

  r.use('/updates', Express.static('/home/jpb/websites/censorbot/updates'))
}
