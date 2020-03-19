module.exports = function (r) {
  r.use(this.adminMiddle(true))

  r.get('/:userid/guilds', (req, res) => {
    res.json(
      this.client.guilds.filter(x => x.owner_id === req.params.userid).map(x => {
        return {
          id: x.id,
          name: x.name
        }
      })
    )
  })
}
