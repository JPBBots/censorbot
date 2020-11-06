module.exports = function (r) {
  r.post('/', (req, res) => {
    this.currents.CURSE_COUNT++
    this.gauge('filter.amount', this.currents.CURSE_COUNT, [], Date.now())
    this.increment('filter.mostused', 1, [`word:${req.query.word}`])
    this.gauge('filter.timing', Number(req.query.time))

    res.json({ success: true })
  })
}
