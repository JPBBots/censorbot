module.exports = function (r) {
  r.get('/@me', async (req, res) => {
    let user
    if (req.cookies.token) user = await this.oauth2.db.findOne({ token: req.cookies.token })

    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    res.status(200).json({ id: user.id, tag: user.tag, avatar: user.avatar, admin: await this.isAdmin(user.id) })
  })
}
