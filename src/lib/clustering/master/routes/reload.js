const suc = { success: true }

module.exports = function (r) {
  r.post('/', (req, res) => {
    this.loadRoutes()

    delete require.cache[require.resolve('../PresenceManager.js')]

    const PresenceManager = require('../PresenceManager')

    this.master.presence = new PresenceManager(this.master)

    this.sendToAll('RELOAD_INTERNALS', {}, false, false)

    res.json(suc)
  })

  r.post('/:part', (req, res) => {
    this.sendToAll('RELOAD', { part: req.params.part })

    res.json(suc)
  })
}
