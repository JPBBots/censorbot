module.exports = function (r) {
  r.use('/:guild_id/:type/:user_id', async (req, res, next) => {
    const db = await this.database.config(req.params.guild_id, false)

    if (!db) return res.json({ failed: true })

    req.db = db

    next()
  })
  r.post('/:guild_id/:type/:user_id', async (req, res) => {
    await this[req.params.type](req.db.id, req.params.user_id, req.db, req.query.extra)

    res.status(204).end()
  })
}
