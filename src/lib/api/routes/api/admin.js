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
}
