const TempSet = require('../../util/TempSet')

module.exports = function (r) {
  const usedCodes = new TempSet(60000)
  r.get('/', (req, res) => {
    res.redirect(this.oauthLogin(null, req.headers.host))
  })

  r.get('/ptb', (req, res) => {
    res.redirect(this.oauthLogin('ptb', req.headers.host))
  })

  r.get('/canary', (req, res) => {
    res.redirect(this.oauthLogin('canary', req.headers.host))
  })

  r.delete('/', async (req, res) => {
    if (req.cookies.token) {
      this.oauth2.guildCache.delete(req.cookies.token)

      res.clearCookie('token')
    }

    res.json({ success: true })
  })

  r.get('/logout', async (req, res) => {
    if (req.cookies.token) {
      this.oauth2.guildCache.delete(req.cookies.token)

      res.clearCookie('token')
    }

    res.redirect('/')
  })

  r.get('/callback', (req, res) => {
    if (req.query.state === 'stop') return res.send('.')
    if (usedCodes.has(req.query.code)) {
      return res.json({
        error: 0,
        message: 'Cannot use the same code twice'
      })
    }
    usedCodes.add(req.query.code)
    this.oauth2.callback(req.query.code, req.headers.host)
      .then(token => {
        res.cookie('token', token, {
          expires: new Date(Date.now() + (10 * 365 * 24 * 60 * 60)) // 10 years lmao
        })

        res.send('<script>window.close()</script>')
      })
      .catch(err => {
        res.json({
          error: err.message
        })
      })
  })
}
