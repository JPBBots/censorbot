module.exports = function (r) {
  r.get('/', (req, res) => {
    res.json({
      hello: 'world'
    })
  })

  r.get('/info', async (req, res) => {
    res.json([{ id: 'master', usage: process.memoryUsage().heapUsed }, ...await this.sendToAll('INFO', {}, true, false)])
  })
}
