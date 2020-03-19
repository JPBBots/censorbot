module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.get('/cmd.json', (req, res) => {
    res.json(this.client.commands.list())
  })

  r.get('/cmd', (req, res) => {
    const dbl = req.url.includes('?dbl')

    if (dbl) {
      this.client.db.collection('stats').updateOne({
        id: 'dbl'
      }, {
        $inc: {
          amount: 1
        }
      })
    }

    res.render('commands', {
      commands: this.client.commands.list(),
      admin: req.url.includes('?a'),
      dbl,
      name: this.client.user.username,
      prefix: this.client.config.prefix[0]
    })
  })
}
