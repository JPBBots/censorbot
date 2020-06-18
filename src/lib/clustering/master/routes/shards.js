const suc = { success: true }

module.exports = function (r) {
  r.get('/', async (req, res) => {
    res.json(await this.sendToAll(
      'CLUSTER_STATS',
      {},
      true
    ))
  })

  r.post('/:shardid', (req, res) => {
    if (isNaN(req.params.shardid)) return res.json({})
    this.master.sharder.addShard(Number(req.params.shardid))

    res.json(suc)
  })

  r.delete('/:shardid', (req, res) => {
    const cluster = this.shardCluster(req.params.shardid)
    if (!cluster) return res.json({})

    cluster.send('RESTART', {
      id: parseInt(req.params.shardid),
      destroy: typeof req.query.d === 'string'
    })

    res.json(suc)
  })
}
