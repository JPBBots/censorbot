const emojis = require('emoji-unicode-map')
delete require.cache[require.resolve('../../filter/filters.js')]
const filters = require('../../filter/filters.js')

module.exports = class JPBFilter {
  constructor (client, linkBypFile) {
    client.log(0, 0, 'Filter')
    this.linkBypFile = linkBypFile
    this.linkByp = require(linkBypFile).links
    this.client = client
    this.replaceSpots = {
      spaces: /(_|\/|\\|\.|\n|&|-|\+|=|:|~|,|\s+)/gi,
      nothing: /("|\*|'|\||`|<|>|#|!|\(|\)|\[|\]|\{|\}|;|%)/gi
    }
    this.emoji_lookup = {
      '🇦': 'a',
      '🇧': 'b',
      '🅱': 'b',
      '🇨': 'c',
      '🇩': 'd',
      '🇪': 'e',
      '🇫': 'f',
      '🇬': 'g',
      '🇭': 'h',
      '🇮': 'i',
      '🇯': 'j',
      '🇰': 'k',
      '🇱': 'l',
      '🇲': 'm',
      '🇳': 'n',
      '🇴': 'o',
      '🇵': 'p',
      '🇶': 'q',
      '🇷': 'r',
      '🇸': 's',
      '🇹': 't',
      '🇺': 'u',
      '🇻': 'v',
      '🇼': 'w',
      '🇽': 'x',
      '🇾': 'y',
      '🇿': 'z',
      '🖕': 'fuck'
    }
    this.client.log(0, 1, 'Filter')
  }

  reload () {
    this.reloadFilter()
    this.reloadLinkByp()
  }

  reloadFilter () {
    delete require.cache[require.resolve(this.filterFile)]
    this.filter = require(this.filterFile)
  }

  reloadLinkByp () {
    delete require.cache[require.resolve(this.linkBypFile)]
    this.linkByp = require(this.linkBypFile).links
  }

  addToBypass (key, newValue) {
    if (!this.filter[key]) this.filter[key] = []
    if (newValue) this.filter[key].push(newValue)
    return this.filter
  }

  /**
     *
     * @param {String} content - Content of message
     * @param {Boolean} GLOBAL - If global filter
     * @param {Array} SERVER - Server filter array
     * @param {Array} UNCENSOR - Uncensor array
     * @returns {Object<censor<boolean>, method<String>, word<RegExp>, arg<String>>} - Response
     */
  test (content, GLOBAL = true, LANGS = [], SERVER = false, UNCENSOR = false) {
    var res = {
      censor: false,
      method: 'none',
      word: null,
      arg: [],
      uncensor: false
    }
    const init = () => {
      // if (UNCENSOR && UNCENSOR[0]) {
      //   var uncensorRes = this.testAgainstArray(this.resolveContent(content).join(' '), UNCENSOR)
      //   if (uncensorRes[0]) {
      //     res.censor = false
      //     return
      //   };
      // }
      const resolvedContent = this.resolveContent(content)
      res.resolved = resolvedContent.join(' ')

      if (GLOBAL) {
        var baseFilter = this.testWithBypass(resolvedContent, filters(LANGS), UNCENSOR)
        if (baseFilter.stopped) {
          res.censor = true
          res.method = 'base'
          res.word = undefined
          res.arg = res.arg.concat(baseFilter.args)
        }
        if (baseFilter.uncensor) res.uncensor = baseFilter.uncensor
      }

      if (SERVER && SERVER[0]) {
        var serverFilter = this.testAgainstArray(resolvedContent.join(' '), SERVER, UNCENSOR)
        if (serverFilter[0]) {
          res.censor = true
          res.method = 'server'
          res.word = serverFilter[1]
          res.arg = res.arg.concat(serverFilter[2])
        }
        if (serverFilter[3]) res.uncensor = serverFilter[3]
      }
    }
    init()
    if (res.censor && this.client) this.addNum()
    return res
  }

  removeAccents (str) {
    var accents = '$ÀÁÂÃÄÅĄĀāàáâãäåąßβÒÓÔÕÕÖØŐòóôőõöøĎďDŽdžÈÉÊËĘèéêëęðÇçČčĆćÐÌÍÎÏĪìíîïīÙÚÛÜŰùűúûüĽĹŁľĺłÑŇŃňñńŔŕŠŚŞšśşŤťŸÝÿýŽŻŹžżźđĢĞģğµ§ṈṉΑΒΝΗΕΙΤƎ△ıскР¡0İĩį@кё'
    var accentsOut = 'sAAAAAAAAaaaaaaaabbOOOOOOOOoooooooDdDZdzEEEEEeeeeeeCcCcCcDIIIIIiiiiiUUUUUuuuuuLLLlllNNNnnnRrSSSsssTtYYyyZZZzzzdGGggusNnABNHEITeaickpioiiiake'
    str = str.split('')
    var strLen = str.length
    var i, x
    for (i = 0; i < strLen; i++) {
      if ((x = accents.indexOf(str[i])) !== -1) {
        str[i] = accentsOut[x]
      }
    }
    return str.join('')
  }

  ;
  resolveContent (str = '') {
    return this.resolveTwos(this.resolveOnes(this.resolvePlusCharacters(this.removeAccents(this.removeLinks(this.resolveEmoji(str.split(' '))).join(' ').replace(this.replaceSpots.spaces, ' ').replace(this.replaceSpots.nothing, '')).slice().trim().split(/ +/g))))
  }

  resolveEmoji (arr) {
    for (var i = 0; i < arr.length; i++) {
      if (this.emoji_lookup[arr[i]]) arr[i] = this.emoji_lookup[arr[i]]
      var thing = emojis.get(arr[i])
      if (thing) arr[i] = thing
    }
    return arr
  }

  resolveOnes (arr) {
    arr = arr.reduce(([last, acc], e) => {
      if (e.length === 1 && (!last || last.length === 1)) {
        if (acc.length === 0) {
          acc.push(e)
        } else {
          acc[acc.length - 1] += e
        }
      } else {
        acc.push(e)
      }
      return [e, acc]
    }, [undefined, []])[1]
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i + 1]) {
        if (arr[i].length === 1 && arr[i + 1].length === 1) {
          arr[i] = arr[i] + arr[i + 1]
          arr[i + 1] = ''
        } else if (arr[i].length === 1 && arr[i + 1].length !== 1) {
          arr[i + 1] = arr[i] + arr[i + 1]
          arr[i] = ''
        } else continue
      } else continue
    }
    return arr
  }

  resolveTwos (arr) {
    for (var i = 0; i < arr.length; i++) {
      if (!arr[i]) continue
      if (!arr[i + 1]) continue
      const arr1 = arr[i]
      const arr2 = arr[i + 1]
      if (arr1.length === 2 && arr2.length === 2) {
        arr[i] = arr1 + arr2
        arr[i + 1] = ''
      }
    }
    return arr
  }

  resolvePlusCharacters (arr) {
    return arr.join(' ').replace(/(s)\1{3,}/g, '$1$1').replace(/(.)\1{3,}/g, '$1').split(' ')
  }

  testAgainstArray (content, arr, UNCENSOR) {
    var res = false
    var site
    var arg = []
    var uncensor = false
    arr.forEach(a => {
      let reg
      try {
        reg = new RegExp(a, 'gi')
      } catch (e) {
        console.log(a + 'err')
      }
      if (!reg) return
      var match = content.match(reg)
      if (UNCENSOR && UNCENSOR.some(x => x.match(reg) && content.match(new RegExp(x, 'gi')))) return uncensor = true // eslint-disable-line no-return-assign
      if (match) {
        res = true
        site = a
        arg.push(reg)
      }
    })
    return [res, site, arg, uncensor]
  }

  testWithBypass (args, obj, uncensor) {
    var res = {
      stopped: false,
      args: [],
      uncensor: false
    }
    args.forEach(arg => {
      Object.keys(obj).forEach(wrd => {
        const word = new RegExp(wrd, 'gi')
        if (uncensor && uncensor.some(u => u.match(word) && arg.match(new RegExp(u, 'gi')))) return res.uncensor = true // eslint-disable-line no-return-assign
        if (arg.match(word)) {
          const array = obj[wrd.toLowerCase()]
          var stop = false
          array.forEach(bypass => {
            if (stop) return
            const sio = new RegExp(bypass, 'gi')
            if (arg.match(sio)) {
              stop = true
            }
          })
          if (!stop) {
            res.stopped = true
            res.args.push(word)
          }
        }
      })
    })
    return res
  }

  removeLinks (arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        if (arr[i].match(/http/gi)) {
          let ok = false
          this.linkByp.forEach(bs => {
            const bsr = new RegExp(bs, 'gi')
            if (arr[i].match(bsr)) {
              ok = true
            }
          })
          if (ok === true) {
            arr = arr.filter(f => f !== arr[i])
          }
        }
      }
    }
    return arr
  }

  addNum () {
    this.client.db.collection('stats').updateOne({
      id: 'deleted'
    }, {
      $inc: {
        amount: 1
      }
    })
  }
}
