module.exports = function (r) {
  r.use('/', async (req, res, next) => {
    const result = await this.oauth2.getGuilds(req.cookies.token)
    if (!result) return res.status(401).json({ error: 'Unauthorized' })

    req.user = result.user
    req.guilds = result.guilds

    const premiumCount = await this.getPremium(req.user.id)
    if (!premiumCount) {
      req.premium = { count: 0, guilds: [] }
      return next()
    }

    let premiumUser = await this.db.collection('premium_users').findOne({ id: req.user.id })
    if (!premiumUser) {
      premiumUser = {
        id: req.user.id,
        guilds: []
      }
      await this.db.collection('premium_users').updateOne({ id: req.user.id }, { $set: premiumUser }, { upsert: true })
    }

    req.premium = { count: premiumCount, guilds: premiumUser.guilds }

    next()
  })

  r.get('/', (req, res) => {
    if (req.premium.count < 1) return res.status(403).json({ error: 'Not Premium' })

    res.json({ premium: req.premium, guilds: req.guilds })
  })

  r.post('/', async (req, res) => {
    if (req.premium.count < 1) return res.status(403).json({ error: 'Not Premium' })

    const { guilds } = req.body

    if (!guilds || guilds.constructor !== Array) return res.status(400).json({ error: 'Invalid Body' })

    if (guilds.length > req.premium.count) return res.status(403).json({ error: 'Not enough available premium slots' })

    if (guilds.some(x => !x.match(/[0-9]{15,17}/))) return res.status(400).json({ error: 'Strange guild ID' })

    await this.db.collection('premium_users').updateOne({ id: req.user.id }, {
      $set: {
        id: req.user.id,
        guilds
      }
    }, {
      upsert: true
    })

    res.json({ guilds })
  })
}
