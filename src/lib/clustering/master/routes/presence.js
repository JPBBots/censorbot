const suc = { success: true }

module.exports = function (r) {
  r.put('/:presence', (req, res) => {
    this.sendToAll('PRESENCE', req.params.presence)

    res.json(suc)
  })
}
