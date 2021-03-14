/* eslint-disable no-control-regex */

const replaceSpots = {
  spaces: /\s|_|\/|\\|\.|\n|&|-|\^|\+|=|:|~|,|\?|\(|\)/gi,
  nothing: /"|\*|'|\||`|<|>|#|!|\[|\]|\{|\}|;|%|\u200D|\u200F|\u200E|\u200C|\u200B/gi // eslint-disable-line no-irregular-whitespace
}

const FilterLoader = require('./Loader.js')

const loader = new FilterLoader()

const JPBExp = require('./JPBExp')

const converter = {
  in: ('\\$,ā,à,á,â,ã,ä,å,ą,ß,β,ò,ó,ô,ő,õ,ö,ø,Ď,ď,D,Ž,d,ž,è,é,ê,ë,ę,ð,Ç,ç,Č,č,Ć,ć,Ð,ì,í,î,ï,ī,ù,ű,ú,û,ü,ľ,ĺ,ł,ň,ñ,ń,Ŕ,ŕ,š,ś,ş,Ť,ť,ÿ,ý,ž,ż,ź,đ,ģ,ğ,µ,§,Ṉ,ṉ,Α,Β,Ν,Η,Ε,Ι,Τ,Ǝ,△,ı,с,к,Р,¡,0,İ,ĩ,į,@,к,ё,а,і,3,1,ů,ķ,₽,¥,ū' + // accents
    ',🖕' + // emojis
    ',’') // extras
    .split(',').map(x => new RegExp(x, 'g')),
  out: ('s,a,a,a,a,a,a,a,a,b,b,o,o,o,o,o,o,o,d,d,d,z,d,z,e,e,e,e,e,e,c,c,c,c,c,c,d,i,i,i,i,i,u,u,u,u,u,l,l,l,n,n,n,r,r,s,s,s,t,t,y,y,z,z,z,d,g,g,u,s,n,n,a,b,n,h,e,i,t,e,a,i,c,k,p,i,o,i,i,i,a,k,e,a,i,e,i,u,k,p,y,u' + // accents
    ',fuck' + // emojis
    ',\'') // extras
    .split(',')
}

const firstShortWords = ['an', 'as', 'us', 'be']
const shortWords = ['it', 'at', 'xd']

function inRange (x, min, max) {
  return ((x - min) * (x - max) <= 0)
}

const linkRegex = /https?:\/\/(www\.)?([-a-zA-Z0-9@:%._+~#=]{1,256})\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
const emailRegex = /([a-zA-Z0-9_\-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)/g

const bothRegex = /(https?:\/\/(www\.)?([-a-zA-Z0-9@:%._+~#=]{1,256})\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)|([a-zA-Z0-9_\-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?))/g

const removeRegex = /\x1D|\x1F/
/**
 * Filter for testing against words
 */
class Filter {
  /**
   * Filter
   */
  constructor () {
    /**
     * Filters
     * @type {Object.<Languages, Array.<JPBExp>>}
     */
    this.filters = null

    this.filterMasks = {
      en: 'English',
      es: 'Spanish',
      off: 'Offensive',
      de: 'German',
      ru: 'Russian',
      server: 'Server',
      invites: 'Invites'
    }

    this.avgNumber = 0
    this.avgCounter = 0
  }

  /**
   * Average Filter Response Time
   * @type {Number}
   */
  get avg () {
    return this.avgNumber / this.avgCounter
  }

  reload () {
    loader.reload()
  }

  surround (text, ranges, sur) {
    text = text.replace(removeRegex, '')
    let links = []
    let splitText = text
      .replace(bothRegex, (text) => {
        return `\x1D${links.push(text) - 1}`
      })
      .split(replaceSpots.spaces)
      .join(' ')

    for (const i in links) {
      splitText = splitText.replace('\x1D' + i, links[i])
    }

    splitText = splitText.split(' ')

    const starterPlaces = []
    const endPlaces = []

    ranges.forEach(range => {
      starterPlaces.push(splitText.slice(0, range[0]).join(' ').length)
      endPlaces.push(splitText.slice(0, range[1] + 1).join(' ').length)
    })

    links = []

    let newText = text
      .replace(bothRegex, (text) => {
        links.push(text)
        return '\x1D'.repeat(text.length)
      })
      .replace(replaceSpots.spaces, (spot, ind) => {
        if (starterPlaces.includes(ind)) spot += '\x1F'
        if (endPlaces.includes(ind)) spot = '\x1F' + spot

        return spot
      })
      .replace(new RegExp(
        sur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      '')
      .replace(/\x1F/g, sur)

    if (starterPlaces.includes(0)) newText = sur + newText
    if (endPlaces.includes(text.length)) newText += sur

    let i = -1

    return newText.replace(/\x1D+/, () => {
      i++
      return links[i]
    }).replace(/`/g, '')
  }

  /**
   * Filter resolved piece
   * @typedef {Object} ResolvedPiece
   * @property {String} t Resolved text
   * @property {Array.<Number>} i Index range
   * @example
   *   .i[0] // Starting index
   *   .i[1] // Ending index
   */

  /**
   * Resolve content
   * @param {String} content Content
   * @param {Boolean} removeFonts Remove fonts
   * @returns {Array.<ResolvedPiece>}
   */
  resolve (content, removeFonts) {
    // base stuff
    content = content
      .toLowerCase()
      .replace(removeRegex, '')
      .replace(/<#?@?!?&?(\d+)>/g, '') // mentions
      .replace(/<a?:(\w+):(\d+)>/g, '$1') // emojis
      .replace(emailRegex, (...email) => {
        return `${email[1]}${email[2]}${email[6]}`.replace(replaceSpots.spaces, '')
      }).replace(linkRegex, (...link) => {
        return `${link[2]}`.replace(replaceSpots.spaces, '')
      })
      .replace(/(\w)\1{2,}/g, '$1$1') // multiple characters only come up once

    for (const i in converter.in) { // convert special character like accents and emojis into their readable counterparts
      content = content.replace(converter.in[i], converter.out[i])
    }

    if (removeFonts) {
      for (const convert of loader.fonts) {
        content = content.replace(convert.in, convert.out)
      }
    }

    let res = Array(content.split(replaceSpots.spaces).length + 1).fill().map(() => ({ i: [], t: '' })) // array of default objects

    content = content.split(replaceSpots.spaces)

    function addSpot (text, spot, index) {
      if (!res[index]) return false
      res[index].t = text

      function checkSpots (s) { // if indexes are outside of the range of the current spot, adjust the range
        if (s < res[index].i[0]) res[index].i[0] = s
        if (s > res[index].i[1]) res[index].i[1] = s
      }

      if (Array.isArray(spot)) {
        if (res[index].i.length < 1) {
          res[index].i = spot
        } else {
          checkSpots(spot[0])
          checkSpots(spot[1])
        }
      } else {
        if (res[index].i.length < 1) {
          res[index].i = [spot, spot]
        } else {
          checkSpots(spot)
        }
      }

      return true
    }

    let spotted = 0
    const nextPushes = []

    for (let i = 0; i < content.length; i++) { // base index pushing to array
      const split = content[i]
        .replace(replaceSpots.nothing, '')
        .split(replaceSpots.spaces)

      for (let spI = 0; spI < split.length; spI++) {
        nextPushes.push({ i: [i, i], t: split[spI], n: true })
        addSpot(
          split[spI],
          i,
          spotted
        )
        spotted++
      }
    }

    res = nextPushes.concat(res)

    for (let i = 0; i < res.length; i++) { // combine < 3 character bits together
      const s = res[i]
      if (firstShortWords.includes(s.t)) continue

      if (s.t && (s.t.length < 3) && res[i + 1]) {
        if (s.n) continue
        if (addSpot(s.t + res[i + 1].t, s.i, i + 1)) {
          s.t = ''
          s.i = []
        }
      }
    }

    for (let i = res.length; i > -1; i--) { // combine < 3 character bits together but going backwards
      const s = res[i]
      if (!s || shortWords.includes(s.t)) continue

      if (s.t && (s.t.length < 3) && res[i - 1]) {
        if (s.n || res[i - 1].n) continue
        if (addSpot(res[i - 1].t + s.t, s.i, i - 1)) {
          s.t = ''
          s.i = []
        }
      }
    }

    // res = res.filter(x => x.t) // remove any blank spaces

    for (let i = 0; i < res.length; i++) { // combine pieces that ends and start with the same character
      const s = res[i]
      if (!s || firstShortWords.some(x => s.t.endsWith(x))) continue

      if (s.t && res[i + 1] && (s.t[s.t.length - 1] === res[i + 1].t[0])) {
        if (s.n) continue
        if (addSpot(s.t + res[i + 1].t, s.i, i + 1)) {
          s.t = ''
        }
      }
    }

    // content = res.filter(x => x.t) // remove any blank spaces (again)

    return res
  }

  /**
   * Response from filter
   * @typedef {Object} FilterResponse
   * @property {Array.<Array.<Number>>} censor Index ranges
   * @property {Languages} filters Filters that picked up a censor
   */

  /**
   * Test against filter
   * @param {String} text Text to test
   * @param {Languages} filters Filters
   * @param {Array.<String>} server Extra filter
   * @param {Array.<String>} uncensor Extra bypass
   * @param {Boolean} removeFonts Remove fonts
   * @returns {FilterResponse}
   */
  test (text, filters = ['en', 'es', 'off'], server = [], uncensor = [], removeFonts = false) {
    const startTime = process.hrtime()

    const content = this.resolve(text, removeFonts)

    const res = {
      censor: false,
      ranges: [],
      filters: [],
      places: []
    }

    const filter = { server: server.map(x => new JPBExp(x)) }

    for (const filt in loader.filters) {
      if (filters.includes(filt)) filter[filt] = loader.filters[filt]
    }

    content.forEach(piece => {
      let done = false
      if (res.ranges.some(x => inRange(x[0], piece.i[0], piece.i[1]) && inRange(x[1], piece.i[0], piece.i[1]))) return
      for (const key in filter) {
        for (const part of filter[key]) {
          if (!part.test(piece.t, uncensor)) continue

          done = true

          res.censor = true
          res.ranges.push(piece.i)
          if (!res.filters.includes(key)) res.filters.push(key)
          res.places.push(part)

          break
        }
        if (done) break
      }
    })

    for (let i = 0; i < res.ranges.length; i++) {
      if (res.ranges[i + 1] && res.ranges[i][1] === res.ranges[i + 1][0]) {
        res.ranges[i + 1][0] = res.ranges[i][0]
        delete res.ranges[i]
      }
    }

    res.ranges = res.ranges.filter(x => x).reverse()

    res.time = process.hrtime(startTime)[1] / 1000000

    this.avgCounter++
    this.avgNumber += res.time

    return res
  }
}

module.exports = Filter
