const suc = { success: true }

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
    res.json([{ id: 'master', usage: process.memoryUsage().heapUsed }, ...await this.sendToAll('INFO', {}, true, false)])
  })
}
