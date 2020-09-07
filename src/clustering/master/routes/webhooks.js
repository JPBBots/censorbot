const settings = require('../../../settings')

module.exports = function (r) {
  Object.keys(settings.webhooks).forEach(key => {
    const wh = settings.webhooks[key]
    r.post(`/${key}`, (req, res) => {
      this.master.discord
        .webhooks[wh.id][wh.token]
        .post({
          body: req.body
        })

      res.json({ success: true })
    })
  })
}
