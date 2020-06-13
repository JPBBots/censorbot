const suc = { success: true }
const Collection = require('../../../../util/Collection')
const GenerateID = require('../../../../util/GenerateID')

const HelpMes = new Collection()

module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.delete('/dash', (req, res) => {
    this.master.clusters.get('dash').send('KILL')

    res.json(suc)
  })

  r.get('/info', async (req, res) => {
    res.json(await this.sendToAll('INFO', {}, true, false))
  })

  r.post('/reload', (req, res) => {
    this.loadRoutes()

    this.sendToAll('RELOAD_INTERNALS', {}, false, false)

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
    res.json(await cluster.send('GUILD_FETCH', { id: req.params.guildid }, true))
  })

  r.get('/shards', async (req, res) => {
    res.json(await this.sendToAll(
      'CLUSTER_STATS',
      {},
      true
    ))
  })

  r.post('/shards/:shardid', (req, res) => {
    if (isNaN(req.params.shardid)) return res.json({})
    this.master.sharder.addShard(Number(req.params.shardid))

    res.json(suc)
  })

  r.delete('/shards/:shardid', (req, res) => {
    const cluster = this.shardCluster(req.params.shardid)
    if (!cluster) return res.json({})

    cluster.send('RESTART', {
      id: parseInt(req.params.shardid),
      destroy: typeof req.query.d === 'string'
    })

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
