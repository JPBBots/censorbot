module.exports = function (r) {
  r.use(async (req, res, next) => {
    if (!req.cookies.token) return res.redirect(this.oauthLogin('admin'))
    const user = await this.db.collection('users').findOne({ token: req.cookies.token })

    if (!user) return res.status(401).json({ error: 'No access' })

    if (!await this.isAdmin(user.id)) return res.status(403).json({ error: 'Not admin' })

    next()
  })

  r.get('/', async (req, res) => {
    const clusters = await this.cluster.internal.shardStats()
    const user = await this.db.collection('users').findOne({ token: req.cookies.token })
    res.render('admin', { clusters, isAdmin: this.isAdmin(user.id) })
  })

  r.post('/', async (req, res) => {
    Object.keys(req.body).forEach(shard => {
      if (req.body[shard] !== '0') this.cluster.internal.restart(shard, req.body[shard] === '2')
    })

    res.status(200).json({})
  })
}
