module.exports = function (r) {
  r.put('/', (req, res) => {
    this.current.TICKET_COUNT++
    this.gauge('ticket.count')
  })
}
