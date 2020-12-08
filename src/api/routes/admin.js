const Filter = require('../../filter/Filter')
const filter = new Filter()

module.exports = function (r) {
  r.use(async (req, res, next) => {
    let user
    if (req.cookies.token) user = await this.oauth2.db.findOne({ token: req.cookies.token })

    let admin
    if (user) admin = await this.isAdmin(user.id)

    if (!admin) return res.status(401).json({ error: 'Unauthorized' })
    next()
  })

  r.get('/', async (req, res) => {
    res.json(await this.cluster.internal.shardStats())
  })

  r.delete('/shards/:id', (req, res) => {
    this.cluster.internal.restart(req.params.id, true)

    res.json({ success: true })
  })

  r.get('/tickets', async (req, res) => {
    res.json(await this.db.collection('tickets').find({ accepted: true }).toArray())
  })

  r.use('/tickets/:id', async (req, res, next) => {
    req.ticket = await this.db.collection('tickets').findOne({ id: req.params.id })

    if (!req.ticket) return res.json({ error: 'Invalid Ticket' })

    if (req.method !== 'DELETE') {
      try {
        filter.reload()
      } catch (err) {
        return res.json({ error: err.message })
      }

      req.test = filter.test(req.ticket.word, { includes: () => true }, [], [])
    }

    next()
  })

  r.get('/tickets/:id', (req, res) => {
    if (!req.test.censor) return res.json({ censored: false })

    res.json({ censored: true, places: req.test.places.map(x => x._text) })
  })

  r.post('/tickets/:id', async (req, res) => {
    if (req.test.censor) return res.json({ error: 'Ticket still censored' })

    this.cluster.internal.reload('filter')

    this.interface.embed
      .title('Ticket finished')
      .description(req.ticket.id)
      .dm(req.ticket.user)

    await this.db.collection('tickets').removeOne({ id: req.ticket.id })

    res.json({ succes: true })

    if (this.cluster.done) this.stats.tickets.accepted.delete()
  })

  r.delete('/tickets/:id', async (req, res) => {
    await this.interface.embed
      .title('After further review, your ticket was denied.')
      .description(req.ticket.id)
      .footer('Reminder that you can always add words to your uncensor list to stop it in your server specifically.')
      .dm(req.ticket.user)

    await this.interface.send(this.config.channels.ticketDenied,
      `<@${req.ticket.admin}> ticket of \`\`\`${req.ticket.word}\`\`\` was denied after you approved it.`
    )

    await this.db.collection('tickets').removeOne({ id: req.ticket.id })

    res.json({ success: true })

    if (this.cluster.done) this.stats.tickets.accepted.delete()
  })
}
