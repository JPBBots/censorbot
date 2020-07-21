const replaceSpots = {
  spaces: /_|\/|\\|\.|\n|&|-|\+|=|:|~|,|\?|\s+/gi,
  nothing: /"|\*|'|\||`|<|>|#|!|\(|\)|\[|\]|\{|\}|;|%|​|‍/gi // eslint-disable-line no-irregular-whitespace
}

const JPBExp = require('../../filter/JPBExp')

const converter = {
  in: ('\\$,ā,à,á,â,ã,ä,å,ą,ß,β,ò,ó,ô,ő,õ,ö,ø,Ď,ď,D,Ž,d,ž,è,é,ê,ë,ę,ð,Ç,ç,Č,č,Ć,ć,Ð,ì,í,î,ï,ī,ù,ű,ú,û,ü,ľ,ĺ,ł,ň,ñ,ń,Ŕ,ŕ,š,ś,ş,Ť,ť,ÿ,ý,ž,ż,ź,đ,ģ,ğ,µ,§,Ṉ,ṉ,Α,Β,Ν,Η,Ε,Ι,Τ,Ǝ,△,ı,с,к,Р,¡,0,İ,ĩ,į,@,к,ё,а,і,3,1,' + // accents
    '🇦,🇧,🅱,🇨,🇩,🇪,🇫,🇬,🇭,🇮,🇯,🇰,🇱,🇲,🇳,🇴,🇵,🇶,🇷,🇸,🇹,🇺,🇻,🇼,🇽,🇾,🇿,🖕') // emojis
    .split(',').map(x => new RegExp(x, 'g')),
  out: ('s,a,a,a,a,a,a,a,a,b,b,o,o,o,o,o,o,o,d,d,d,z,d,z,e,e,e,e,e,e,c,c,c,c,c,c,d,i,i,i,i,i,u,u,u,u,u,l,l,l,n,n,n,r,r,s,s,s,t,t,y,y,z,z,z,d,g,g,u,s,n,n,a,b,n,h,e,i,t,e,a,i,c,k,p,i,o,i,i,i,a,k,e,a,i,e,i,' + // accents
    'a,b,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,fuck') // emojis
    .split(',')
}

const GetFilters = require('../../filter/filters')

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

    this._loadFilters()
  }

  _loadFilters () {
    this.filters = GetFilters()
  }

  surround (text, ranges, sur) {
    const used = []
    function surroundRange (txt, range) {
      if (used.some(x => x[0] === range[0] || x[1] === range[1])) return txt
      txt = txt.split(/\s+/)

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
   * @returns {Array.<ResolvedPiece>}
   */
  resolve (content) {
    // base stuff
    content = content
      .toLowerCase()
      .replace(/<#?@?!?&?(\d+)>/g, '') // mentions
      .replace(/<:(\w+):(\d+)>/g, '$1')
      .replace(/ +/g, ' ') // multiple spaces
      .replace(/(.)\1{2,}/g, '$1$1') // multiple characters only come up once

    for (const i in converter.in) { // convert special character like accents and emojis into their readable counterparts
      content = content.replace(converter.in[i], converter.out[i])
    }

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

    for (let i = 0; i < content.length; i++) { // base index pushing to array
      const split = content[i]
        .replace(replaceSpots.nothing, '')
        .split(replaceSpots.spaces)

      for (let spI = 0; spI < split.length; spI++) {
        res.push({ i: [i, i], t: split[spI], n: true })
        addSpot(
          split[spI],
          i,
          spI + i
        )
      }
    }

    for (let i = 0; i < res.length; i++) { // combine < 3 character bits together
      const s = res[i]

      if (s.n) continue

      if (s.t && (s.t.length < 3) && res[i + 1]) {
        if (addSpot(s.t + res[i + 1].t, s.i, i + 1)) {
          s.t = ''
          s.i = []
        }
      }
    }

    for (let i = res.length; i > -1; i--) { // combine < 3 character bits together but going backwards
      const s = res[i]
      if (!s || s.n) continue

      if (s.t && (s.t.length < 3) && res[i - 1]) {
        if (addSpot(res[i - 1].t + s.t, s.i, i - 1)) {
          s.t = ''
          s.i = []
        }
      }
    }

    res = res.filter(x => x.t) // remove any blank spaces

    for (let i = 0; i < res.length; i++) { // combine pieces that ends and start with the same character
      const s = res[i]

      if (s.n) continue

      if (s.t && res[i + 1] && (s.t[s.t.length - 1] === res[i + 1].t[0])) {
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
   * @returns {FilterResponse}
   */
  test (text, filters = ['en', 'es', 'off'], server = [], uncensor = []) {
    const content = this.resolve(text)

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

    res.ranges = res.ranges.filter(x => x)

    return res
  }
}

module.exports = Filter
