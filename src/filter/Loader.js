const fs = require('fs')
const path = require('path')

const JPBExp = require('./JPBExp')

/**
 * Class responsible for loading data files for the filter
 */
class FilterLoader {
  /**
   * Filter loader
   */
  constructor () {
    /**
     * Filters
     * @type {Object.<String, Object.<String, Array>>}
     */
    this.filters = {}
    /**
     * Font recog
     * @type {Object.<String, String>}
     */
    this.fonts = []

    this.reload()
  }

  reload () {
    this._loadFilters()
    this._loadFontPacks()

    return true
  }

  _loadFilters () {
    this.filters = {}
    fs.readdirSync(path.resolve(__dirname, './data/filters')).forEach(filter => {
      const [name, ext] = filter.split('.')
      if (ext !== 'json') return
      delete require.cache[require.resolve(`./data/filters/${filter}`)]

      const filt = require(`./data/filters/${filter}`)

      this.filters[name] = []

      Object.keys(filt).forEach(fil => {
        this.filters[name].push(new JPBExp(fil, filt[fil]))
      })
    })
  }

  _loadFontPacks () {
    this.fonts = []
    delete require.cache[require.resolve('./data/fontpacks.json')]

    const fontPacks = require('./data/fontpacks.json')
    fontPacks.forEach(font => {
      font.split(' ').forEach((x, i) => {
        this.fonts.push({
          in: new RegExp(x, 'gi'),
          out: this.constructor.alphabet[i]
        })
      })
    })
  }
}

FilterLoader.alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

module.exports = FilterLoader
