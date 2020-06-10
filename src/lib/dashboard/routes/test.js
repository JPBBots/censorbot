module.exports = function (r) {
  r.get('/sidebar', (req, res) => {
    res.render('testsidebar')
  })
}
