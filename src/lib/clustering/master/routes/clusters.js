const suc = { success: true }

module.exports = function (r) {
  r.post('/', async (req, res) => {
    res.json(await this.sendToAll('EVAL', { ev: req.body.ev }, true))
  })

  r.delete('/', async (req, res) => {
    res.json(suc)

    for (let i = 0; i < this.master.internalClusters.length; i++) {
      await this.master.restartCluster(i)
    }
  })

  r.delete('/:clusterid', (req, res) => {
    this.master.restartCluster(req.params.clusterid)

    res.json(suc)
  })
}
