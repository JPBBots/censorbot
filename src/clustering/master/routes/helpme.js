const Collection = require('../../../util/Collection')
const GenerateID = require('../../../util/GenerateID')

const HelpMes = new Collection()

module.exports = function (r) {
  r.post('/', (req, res) => {
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

  r.get('/:hm', (req, res) => {
    const hm = HelpMes.get(req.params.hm)
    if (!hm) return res.json({ error: true })

    res.json(hm)
  })
}
