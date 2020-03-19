module.exports = function (r) {
  r.get('/', (req, res) => {
    res.redirect(this.oauthLogin())
  })

  r.get('/callback', (req, res) => {
    this.callback(req)
  })

  r.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.render('logout', { base: this.base })
  })
}
