module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.use('/:serverid', this.getGuild(true))

  r.get('/:serverid', this.guildData(true, (req, res, data) => {
    res.json(data)
  }))

  r.post('/:serverid', this.guildData(true, async (req, res, data) => {
    const valid = this.validateSettings(req.body, data, (msg) => {
      res.json({ error: `Bad Settings: ${msg}` })
      return false
    })

    let refresh = false

    const premium = await this.client.db.guildPremium(data.id)

    if (!premium) {
      if (req.body.filter.length > 150) return res.json({ error: 'Non-premium servers can only have maximum 150 words in their filter' })
      if (req.body.webhook || req.body.channels.length > 0 || req.body.pop_delete > 120 * 1000 || req.body.multi) refresh = true
      req.body.webhook = false
      req.body.multi = false
      req.body.channels = []
      if (req.body.pop_delete > 120 * 1000) req.body.pop_delete = 120 * 1000
    } else {
      if (req.body.filter.length > 500) return res.json({ error: 'Premium servers can only have maximum 500 words in their filter' })
      if (req.body.pop_delete > 600 * 1000) {
        refresh = true
        req.body.pop_delete = 600 * 1000
      }
    }

    if (!valid) return
    const post = await this.client.db.setConfig(data.id, req.body)
      .catch(err => { res.json({ error: 'Database Error' }); return false }) // eslint-disable-line handle-callback-err
    if (!post) return

    res.json({ success: true, refresh })
  }))
}
