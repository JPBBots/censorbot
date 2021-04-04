/* eslint-disable no-control-regex */
import filter from '../data/filter'

import { JPBExp } from './JPBExp'

import { filterType } from 'typings/api'
delete require.cache[require.resolve('../data/filter')]

function inRange (x: number, min: number, max: number): boolean {
  return ((x - min) * (x - max) <= 0)
}

type filterName = filterType | 'server' | 'invites'

type Range = [number, number] | []

interface ResolvedPiece {
  i: Range
  t: string
  n?: boolean
}

export interface FilterResponse {
  censor: boolean
  ranges: Range[]
  filters: filterName[]
  places: JPBExp[]
}

const removeRegex = /\x1D|\x1F/

type filterObj = {
  [key in filterType]: JPBExp[]
}

const filtObj = {} as filterObj

export class Filter {
  masks: {
    [key in filterName]: string
  } = {
    en: 'English',
    es: 'Spanish',
    off: 'Offensive',
    de: 'German',
    ru: 'Russian',
    server: 'Server',
    invites: 'Invites'
  }

  filters = Object.keys(filter.filters).reduce<filterObj>((a, b) => {
    a[b] = Object.keys(filter.filters[b]).reduce<JPBExp[]>((c, d) => {
      c.push(new JPBExp(d, filter.filters[b][d]))

      return c
    }, [])

    return a
  }, filtObj)

  surround (text: string, ranges: Range[], sur: string): string {
    text = text.replace(removeRegex, '')
    let links: string[] = []
    let splitText: string | string[] = text
      .replace(filter.bothRegex, (text) => {
        return `\x1D${links.push(text) - 1}`
      })
      .split(filter.replaceSpots.spaces)
      .join(' ')

    for (const i in links) {
      splitText = splitText.replace('\x1D' + i, links[i])
    }

    splitText = splitText.split(' ')

    const starterPlaces: number[] = []
    const endPlaces: number[] = []

    ranges.forEach(range => {
      starterPlaces.push((splitText as string[]).slice(0, range[0]).join(' ').length)
      endPlaces.push((splitText as string[]).slice(0, (range[1] ?? 0) + 1).join(' ').length)
    })

    links = []

    let newText = text
      .replace(filter.bothRegex, (text) => {
        links.push(text)
        return '\x1D'.repeat(text.length)
      })
      .replace(filter.replaceSpots.spaces, (spot, ind) => {
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

  resolve (content: string | string[], removeFonts: boolean = false): ResolvedPiece[] {
    // base stuff
    content = (content as string)
      .toLowerCase()
      .replace(removeRegex, '')
      .replace(/<#?@?!?&?(\d+)>/g, '') // mentions
      .replace(/<a?:(\w+):(\d+)>/g, '$1') // emojis
      .replace(filter.emailRegex, (...email: string[]) => {
        return `${email[1]}${email[2]}${email[6]}`.replace(filter.replaceSpots.spaces, '')
      }).replace(filter.linkRegex, (...link: string[]) => {
        return `${link[2]}`.replace(filter.replaceSpots.spaces, '')
      })
      .replace(/(\w)\1{2,}/g, '$1$1') // multiple characters only come up once

    content = filter.converter(content) as string

    if (removeFonts) content = filter.resolveFont(content) as string

    let res: ResolvedPiece[] = Array(content.split(filter.replaceSpots.spaces).length + 1)
      .fill(null).map(() => ({ i: [], t: '' })) // array of default objects

    content = content.split(filter.replaceSpots.spaces)

    function addSpot (text: string, spot: number | Range, index: number): boolean {
      if (!res[index]) return false
      res[index].t = text

      function checkSpots (s): void { // if indexes are outside of the range of the current spot, adjust the range
        if (s < (res[index].i[0] ?? 0)) res[index].i[0] = s
        if (s > (res[index].i[1] ?? 0)) res[index].i[1] = s
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
    const nextPushes: ResolvedPiece[] = []

    for (let i = 0; i < content.length; i++) { // base index pushing to array
      const split = content[i]
        .replace(filter.replaceSpots.nothing, '')
        .split(filter.replaceSpots.spaces)

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
      if (filter.firstShortWords.includes(s.t)) continue

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
      if (!s || filter.shortWords.includes(s.t)) continue

      if (s.t && (s.t.length < 3) && res[i - 1]) {
        if (s.n ?? res[i - 1].n) continue
        if (addSpot(res[i - 1].t + s.t, s.i, i - 1)) {
          s.t = ''
          s.i = []
        }
      }
    }

    for (let i = 0; i < res.length; i++) { // combine pieces that ends and start with the same character
      const s = res[i]
      if (!s || filter.firstShortWords.some(x => s.t.endsWith(x))) continue

      if (s.t && res[i + 1] && (s.t[s.t.length - 1] === res[i + 1].t[0])) {
        if (s.n) continue
        if (addSpot(s.t + res[i + 1].t, s.i, i + 1)) {
          s.t = ''
        }
      }
    }

    res = res.filter(x => x.t) // remove any blank spaces

    return res
  }

  test (text: string, filters: filterType[], server: string[] = [], uncensor: string[] = [], removeFonts: boolean = false): FilterResponse {
    const content = this.resolve(text, removeFonts)

    const res: FilterResponse = {
      censor: false,
      ranges: [],
      filters: [],
      places: []
    }

    const scanFor: {
      [key in filterName]?: JPBExp[]
    } = { server: server.map(x => new JPBExp(x)) }

    for (const filt in this.filters) {
      if (filters.includes(filt as filterType)) scanFor[filt] = this.filters[filt]
    }

    content.forEach(piece => {
      let done = false
      if (res.ranges.some(x => x[0] !== undefined && x[1] !== undefined && inRange(x[0], piece.i[0] as number, piece.i[1] as number) && inRange(x[1], piece.i[0] as number, piece.i[1] as number))) return
      for (const key in scanFor) {
        for (const part of scanFor[key]) {
          if (!part.test(piece.t, uncensor)) continue

          done = true

          res.censor = true
          res.ranges.push(piece.i)
          if (!res.filters.includes(key as filterName)) res.filters.push(key as filterName)
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

    return res
  }
}
