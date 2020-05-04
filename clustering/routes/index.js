const suc = { success: true }
const Collection = require('../../util/Collection')
const GenerateID = require('../../util/GenerateID')

const HelpMes = new Collection()

module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.delete('/dash', (req, res) => {
    this.master.dash.send('KILL')

    res.json(suc)
  })

  r.post('/reload', (req, res) => {
    this.loadRoutes()

    this.sendToAll('RELOAD_INTERNALS')

    res.json(suc)
  })

  r.post('/reload/:part', (req, res) => {
    this.sendToAll('RELOAD', { part: req.params.part })

    res.json(suc)
  })

  r.get('/guilds', async (req, res) => {
    res.json(await this.sendToAll(
      'GUILD_COUNT',
      {},
      true
    ))
  })

  r.get('/guilds/:guildid', async (req, res) => {
    const cluster = this.guildCluster(req.params.guildid)
    if (!cluster) return res.json({})
    res.json(await this.sendTo(
      cluster.id,
      'GUILD_FETCH',
      { id: req.params.guildid },
      true
    ))
  })

  r.get('/shards', async (req, res) => {
    res.json(await this.sendToAll(
      'CLUSTER_STATS',
      {},
      true
    ))
  })

  r.delete('/shards/:shardid', (req, res) => {
    this.sendTo(
      this.shardCluster(req.params.shardid).id,
      'RESTART',
      {
        id: parseInt(req.params.shardid),
        destroy: typeof req.query.d === 'string'
      }
    )

    res.json(suc)
  })

  r.post('/clusters', async (req, res) => {
    res.json(await this.sendToAll('EVAL', { ev: req.body.ev }, true))
  })

  r.delete('/clusters', async (req, res) => {
    res.json(suc)

    for (let i = 0; i < this.master.internalClusters.length; i++) {
      await this.master.restartCluster(i)
    }
  })

  r.delete('/clusters/:clusterid', (req, res) => {
    this.master.restartCluster(req.params.clusterid)

    res.json(suc)
  })

  r.put('/presence/:presence', (req, res) => {
    this.sendToAll('PRESENCE', req.params.presence)

    res.json(suc)
  })

  r.post('/helpme', (req, res) => {
    const { id, name, owner } = req.body

    let hm

    const current = HelpMes.find(x => x.id === id)

    if (current) {
      hm = current.hm
    } else {
      hm = GenerateID(HelpMes.keyArray())
      HelpMes.set(hm, { hm, id, name, owner })
      setTimeout(() => {
        HelpMes.delete(id)
      }, 300000)
    }

    res.json({ hm })
  })

  r.get('/helpme/:hm', (req, res) => {
    const hm = HelpMes.get(req.params.hm)
    if (!hm) return res.json({ error: true })

    res.json(hm)
  })

  return r
}
