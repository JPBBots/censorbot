const suc = { success: true }

module.exports = function (r) {
  r.post('/', (req, res) => {
    this.master.presence.go()

    res.json(suc)
  })
  r.put('/:presence', (req, res) => {
    this.master.presence.set(req.params.presence)

    res.json(suc)
  })
}
