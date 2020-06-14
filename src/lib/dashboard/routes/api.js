module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })
}
