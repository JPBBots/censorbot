module.exports = function (r) {
  r.post('/', (req, res) => {
    this.currents.CURSE_COUNT++
    this.gauge('filter.amount', this.currents.CURSE_COUNT, [], Date.now())

    req.query.word.split(',').forEach(word => {
      if (!word) return
      this.increment('filter.mostused.words', 1, [`word:${word}`])
    })
    req.query.filter.split(',').forEach(filter => {
      if (!filter) return
      this.increment('filter.mostused.filters', 1, [`filter:${filter}`])
    })

    this.gauge('filter.timing', Number(req.query.time))

    res.json({ success: true })
  })
}
