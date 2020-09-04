module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.get('/info', async (req, res) => {
    res.json([{ id: 'master', usage: process.memoryUsage().heapUsed, stat: `${this.master.clusters.size} workers` }, ...await this.sendToAll('INFO', {}, true, false)])
  })

  r.post('/eval', async (req, res) => {
    try {
      const master = this.master // eslint-disable-line
      let results = eval(req.body.ev) // eslint-disable-line
      if (results && results.then) results = await results
      res.json({ result: results })
    } catch (err) {
      res.json({ result: 'Error: ' + err.message })
    }
  })
}
