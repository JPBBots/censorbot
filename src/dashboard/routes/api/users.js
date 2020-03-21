module.exports = function (r) {
  r.use(this.adminMiddle(true))

  r.get('/:userid/guilds', (req, res) => {
    const guilds = this.client.userGuilds.get(req.params.userid) || []

    res.json(
      this.client.guilds.filter(x => guilds.includes(x.id)).map(x => {
        return {
          id: x.id,
          name: x.name
        }
      })
    )
  })
}
