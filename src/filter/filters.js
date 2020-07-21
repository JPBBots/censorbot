const fs = require('fs')
const path = require('path')

const JPBExp = require('./JPBExp')

module.exports = () => {
  const filters = {}
  fs.readdirSync(path.resolve(__dirname, './filters')).forEach(filter => {
    const [name, ext] = filter.split('.')
    if (ext !== 'json') return
    delete require.cache[require.resolve(`./filters/${filter}`)]

    const filt = require(`./filters/${filter}`)

    filters[name] = []

    Object.keys(filt).forEach(fil => {
      filters[name].push(new JPBExp(fil, filt[fil]))
    })
  })

  return filters
}

/**
 * Languages used by the base filter
 * @typedef {Array} Languages
 * @default ['en', 'es', 'off']
 * @example
 * en: English
 * es: Spanish
 * off: Offensive
 */
