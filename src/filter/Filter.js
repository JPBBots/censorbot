const replaceSpots = {
  spaces: /_|\/|\\|\.|\n|&|-|\^|\+|=|:|~|,|\?|\(|\)|\s+/gi,
  nothing: /"|\*|'|\||`|<|>|#|!|\[|\]|\{|\}|;|%|​|‍/gi // eslint-disable-line no-irregular-whitespace
}

const replaceFonts = require('../util/replace-fonts')

const JPBExp = require('./JPBExp')

const converter = {
  in: ('\\$,ā,à,á,â,ã,ä,å,ą,ß,β,ò,ó,ô,ő,õ,ö,ø,Ď,ď,D,Ž,d,ž,è,é,ê,ë,ę,ð,Ç,ç,Č,č,Ć,ć,Ð,ì,í,î,ï,ī,ù,ű,ú,û,ü,ľ,ĺ,ł,ň,ñ,ń,Ŕ,ŕ,š,ś,ş,Ť,ť,ÿ,ý,ž,ż,ź,đ,ģ,ğ,µ,§,Ṉ,ṉ,Α,Β,Ν,Η,Ε,Ι,Τ,Ǝ,△,ı,с,к,Р,¡,0,İ,ĩ,į,@,к,ё,а,і,3,1,ů,ķ,₽,¥,ū' + // accents
    ',🇦,🇧,🅱,🇨,🇩,🇪,🇫,🇬,🇭,🇮,🇯,🇰,🇱,🇲,🇳,🇴,🇵,🇶,🇷,🇸,🇹,🇺,🇻,🇼,🇽,🇾,🇿,🖕' + // emojis
    ',’') // extras
    .split(',').map(x => new RegExp(x, 'g')),
  out: ('s,a,a,a,a,a,a,a,a,b,b,o,o,o,o,o,o,o,d,d,d,z,d,z,e,e,e,e,e,e,c,c,c,c,c,c,d,i,i,i,i,i,u,u,u,u,u,l,l,l,n,n,n,r,r,s,s,s,t,t,y,y,z,z,z,d,g,g,u,s,n,n,a,b,n,h,e,i,t,e,a,i,c,k,p,i,o,i,i,i,a,k,e,a,i,e,i,u,k,p,y,u' + // accents
    ',a,b,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,fuck' + // emojis
    ',\'') // extras
    .split(',')
}

const firstShortWords = ['an', 'as', 'us', 'be']
const shortWords = ['it', 'at', 'xd']

const GetFilters = require('./filters')

function inRange (x, min, max) {
  return ((x - min) * (x - max) <= 0)
}

const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
const emailRegex = /^([a-zA-Z0-9_\-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/g

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

    this._loadFilters()
  }

  /**
   * Average Filter Response Time
   * @type {Number}
   */
  get avg () {
    return this.avgNumber / this.avgCounter
  }

  _loadFilters () {
    this.filters = GetFilters()
  }

  surround (text, ranges, sur) {
    const used = []
    function surroundRange (txt, range) {
      if (used.some(x => inRange(range[0], ...x) && inRange(range[1], ...x))) return txt
      txt = txt.split(/ +/)

      txt[range[0]] = `${sur}${txt[range[0]]}`
      txt[range[1] - (txt[range[1]] ? 0 : 1)] = `${txt[range[1] - (txt[range[1]] ? 0 : 1)] || ''}${sur}`

      used.push(range)

      return txt.join(' ')
    }

    return ranges.reduce((a, b) => surroundRange(a, b), text)
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
      .replace(/<#?@?!?&?(\d+)>/g, '') // mentions
      .replace(/<a?:(\w+):(\d+)>/g, '$1') // emojis
      .replace(/(.)\1{2,}/g, '$1$1') // multiple characters only come up once

    content = content.split(' ')

    for (const i in content) {
      content[i] = content[i].replace(emailRegex, '$1 $2 $6').replace(linkRegex, '$3')
    }

    content = content.join(' ')

    for (const i in converter.in) { // convert special character like accents and emojis into their readable counterparts
      content = content.replace(converter.in[i], converter.out[i])
    }

    if (removeFonts) content = replaceFonts(content).toLowerCase()

    let res = Array(content.split(replaceSpots.spaces).length + 1).fill().map(() => ({ i: [], t: '' })) // array of default objects

    content = content.split(' ')

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

    res = res.filter(x => x.t) // remove any blank spaces

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

    content = res.filter(x => x.t) // remove any blank spaces (again)

    return content
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
  test (text, filters = ['en', 'es', 'off'], server = [], uncensor = [], removeFonts) {
    const startTime = process.hrtime()

    const content = this.resolve(text, removeFonts)

    const res = {
      censor: false,
      ranges: [],
      filters: [],
      places: []
    }

    const filter = { server: server.map(x => new JPBExp(x)) }

    for (const filt in this.filters) {
      if (filters.includes(filt)) filter[filt] = this.filters[filt]
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
