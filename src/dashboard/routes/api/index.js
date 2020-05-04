module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.get('/cmd.json', (req, res) => {
    res.json(this.commands.list())
  })

  r.get('/cmd', (req, res) => {
    const dbl = req.url.includes('?dbl')

    if (dbl) {
      this.database.collection('stats').updateOne({
        id: 'dbl'
      }, {
        $inc: {
          amount: 1
        }
      })
    }

    res.render('commands', {
      commands: this.commands.list(),
      admin: req.url.includes('?a'),
      dbl,
      name: 'Censor Bot',
      prefix: this.config.prefix[0]
    })
  })
}
