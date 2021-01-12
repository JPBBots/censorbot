module.exports = function (r) {
  r.use('/@me', async (req, res, next) => {
    let user
    if (req.cookies.token) user = await this.oauth2.db.findOne({ token: req.cookies.token })

    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const premium = {
      count: 0,
      guilds: []
    }

    const premiumCount = await this.getPremium(user.id)
    if (premiumCount) {
      premium.count = premiumCount
      let premiumUser = await this.db.collection('premium_users').findOne({ id: user.id })
      if (!premiumUser) {
        premiumUser = {
          id: user.id,
          guilds: []
        }
        await this.db.collection('premium_users').updateOne({ id: user.id }, { $set: premiumUser }, { upsert: true })
      }
      premium.guilds = premiumUser.guilds
    }

    req.user = { id: user.id, tag: user.tag, avatar: user.avatar, premium, admin: await this.isAdmin(user.id) }

    next()
  })

  r.get('/@me', (req, res) => {
    res.json(req.user)
  })

  r.post('/@me/premium', async (req, res) => {
    if (req.user.premium.count < 1) return res.status(403).json({ error: 'Not Premium' })

    const { guilds } = req.body

    if (!guilds || guilds.constructor !== Array) return res.status(400).json({ error: 'Invalid Body' })

    if (guilds.length > req.user.premium.count) return res.status(403).json({ error: 'Not enough available premium slots' })

    if (guilds.some(x => !x.match(/[0-9]{15,17}/))) return res.status(400).json({ error: 'Strange guild ID' })

    await this.db.collection('premium_users').updateOne({ id: req.user.id }, {
      $set: {
        id: req.user.id,
        guilds
      }
    }, {
      upsert: true
    })

    res.json(guilds)
  })
}
