module.exports = function (r) {
  r.put('/', (req, res) => {
    this.currents.TICKET_WAITING_COUNT++
    this.gauge('tickets.waiting', this.currents.TICKET_WAITING_COUNT, [], Date.now())
    this.gauge('tickets.total', this.currents.TICKET_ACCEPTED_COUNT + this.currents.TICKET_WAITING_COUNT, [], Date.now())

    res.json({ success: true })
  })
  r.delete('/', (req, res) => {
    this.currents.TICKET_WAITING_COUNT--
    this.gauge('tickets.waiting', this.currents.TICKET_WAITING_COUNT, [], Date.now())
    this.gauge('tickets.total', this.currents.TICKET_ACCEPTED_COUNT + this.currents.TICKET_WAITING_COUNT, [], Date.now())
    this.increment('tickets.reviewers', 1, [`user:${req.user}`])

    res.json({ success: true })
  })
}
