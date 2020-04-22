const Difference = require('../../../../util/Difference')

module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.use('/:serverid', this.getGuild(true))

  r.get('/:serverid', this.guildData(true, (req, res, data) => {
    res.json(data)
  }))

  r.post('/:serverid', this.guildData(true, async (req, res, data) => {
    const valid = this.validateSettings(req.body, data, (msg) => {
      res.json({ error: `Bad Settings: ${msg}` })
      return false
    })

    if (!valid) return

    let refresh = false

    const premium = await this.client.db.guildPremium(data.id)

    if (!premium) {
      if (req.body.filter.length > 150) return res.json({ error: 'Non-premium servers can only have maximum 150 words in their filter' })
      if (req.body.webhook || req.body.channels.length > 0 || req.body.pop_delete > 120 * 1000 || req.body.multi || req.body.webhook_replace !== 0 || req.body.webhook_separate !== false) refresh = true
      req.body.webhook = false
      req.body.multi = false
      req.body.channels = []
      req.body.wehbook_replace = 0
      req.body.webhook_separate = false
      if (req.body.pop_delete > 120 * 1000) req.body.pop_delete = 120 * 1000
    } else {
      if (req.body.filter.length > 500) return res.json({ error: 'Premium servers can only have maximum 500 words in their filter' })
      if (req.body.pop_delete > 600 * 1000) {
        refresh = true
        req.body.pop_delete = 600 * 1000
      }
    }

    delete data.db.id

    const differences = Difference(data.db, req.body)

    if (differences.length > 0) {
      const logs = (await this.client.db.collection('log').findOne({ id: data.id })) || { id: data.id, logs: [] }
      if (logs.logs.length > 9) logs.logs = logs.logs.slice(1)
      const { tag: user } = await this.db.findOne({ token: req.headers.authorization })
      logs.logs.push({ user, differences })

      this.client.db.collection('log').updateOne({
        id: data.id
      }, {
        $set: logs
      }, {
        upsert: true
      })
    }
    const post = await this.client.db.setConfig(data.id, req.body)
      .catch(err => { res.json({ error: 'Database Error' }); return false }) // eslint-disable-line handle-callback-err
    if (!post) return

    res.json({ success: true, refresh })
  }))

  r.get('/:serverid/logs', async (req, res) => {
    const logs = await this.client.db.collection('log').findOne({ id: req.partialGuild.i })

    if (!logs) res.send([])

    res.json(logs.logs)
  })
}
