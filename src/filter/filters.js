const fs = require('fs')
const path = require('path')
const filters = {}
fs.readdirSync(path.resolve(__dirname, './filters')).forEach(filter => {
  const [name, ext] = filter.split('.')
  if (ext !== 'json') return
  delete require.cache[require.resolve(`./filters/${filter}`)]
  filters[name] = require(`./filters/${filter}`)
})

module.exports = (languages) => {
  return languages.reduce((a, b) => {
    if (!filters[b]) return a
    return {
      ...a,
      ...filters[b]
    }
  }, {})
}
