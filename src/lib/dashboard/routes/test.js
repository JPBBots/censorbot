module.exports = function (r) {
  r.get('/e', (req, res) => {
    res.redirect('/')
  })

  r.get('/logout', (req, res) => {
    res.status(200).render('logout', {
      isAdmin: false,
      noSidebar: true
    })
  })
}
