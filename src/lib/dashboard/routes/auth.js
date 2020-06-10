module.exports = function (r) {
  r.get('/', (req, res) => {
    res.redirect(this.oauthLogin())
  })

  r.get('/logout', async (req, res) => {
    if (req.cookies.token) {
      this.oauth2.guildCache.delete(req.cookies.token)
      const timeout = this.oauth2.timeouts.get(req.cookies.token)
      clearTimeout(timeout)
      this.oauth2.timeouts.delete(req.cookies.token)

      res.clearCookie('token')
    }

    res.render('logout', { isAdmin: false })
  })

  r.get('/callback', (req, res) => {
    this.oauth2.callback(req.query.code)
      .then(token => {
        res.cookie('token', token, {
          expires: new Date(Date.now() + (10 * 365 * 24 * 60 * 60)) // 10 years lmao
        })

        res.redirect(`${this.dash}/${req.query.state || ''}`)
      })
      .catch(err => {
        res.render('error', {
          happening: 'logging you in',
          error: err.message,
          tryAgain: this.oauthLogin(req.query.state),
          isAdmin: false
        })
      })
  })
}
