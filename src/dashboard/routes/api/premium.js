module.exports = function (r) {
  r.use(this.premiumMiddle(true))

  r.get('/', (req, res) => {
    res.json(req.premium)
  })

  r.put('/:serverid', async (req, res) => {
    if (req.premium.guilds.includes(req.params.serverid)) return res.json({ error: 'Server already premium' })

    if (req.premium.guilds.length >= req.premium.amount) return res.json({ error: 'Out of premiums' })

    req.premium.guilds.push(req.params.serverid)

    await this.database.collection('premium_users').updateOne({ id: req.user.id }, {
      $set: {
        id: req.user.id,
        guilds: req.premium.guilds
      }
    }, {
      upsert: true
    })

    res.json({ success: true })
  })

  r.delete('/:serverid', async (req, res) => {
    if (!req.premium.guilds.includes(req.params.serverid)) return res.json({ error: 'Server not premium' })

    req.premium.guilds = req.premium.guilds.filter(x => x !== req.params.serverid)

    await this.database.collection('premium_users').updateOne({ id: req.user.id }, {
      $set: {
        id: req.user.id,
        guilds: req.premium.guilds
      }
    }, {
      upsert: true
    })

    res.json({ success: true })
  })
}
