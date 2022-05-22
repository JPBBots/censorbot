/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-control-regex */
import { JPBExp } from './JPBExp'

import {
  baseFilters,
  FilterResultInfo,
  FilterType,
  Range,
  FilterSettings
} from '@censorbot/typings'

function inRange(x: number, min: number, max: number): boolean {
  return (x - min) * (x - max) <= 0
}

interface ResolvedPiece {
  i: Range
  t: string
  n?: boolean
}

const removeRegex = /\x1D|\x1F/

const firstShortWords = ['an', 'as', 'us', 'be']
const shortWords = ['it', 'at', 'xd']

export enum FilterDatabaseEntryType {
  BaseFilter = 0,
  RegExp,
  Chars
}

export type FilterDatabaseEntry =
  | {
      type: FilterDatabaseEntryType.BaseFilter
      filter: baseFilters
      filterData: Record<string, string[]>
    }
  | {
      type: FilterDatabaseEntryType.RegExp
      name: RegExpTypes
      regex: string
    }
  | {
      type: FilterDatabaseEntryType.Chars
      chars: Record<string, string[]>
    }

type RegExpTypes =
  | 'combining'
  | 'link'
  | 'email'
  | 'both'
  | 'replaceSpaces'
  | 'replaceNothing'

export class Filter {
  filters: {
    [key in baseFilters]?: JPBExp[]
  } = {}

  regex: {
    [key in RegExpTypes]: RegExp
  } = {
    link: /https?:\/\/(www\.)?([-a-zA-Z0-9@:%._+~#=]{1,256})\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
    email:
      /([a-zA-Z0-9_\-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)/g,
    both: /(https?:\/\/(www\.)?([-a-zA-Z0-9@:%._+~#=]{1,256})\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)|([a-zA-Z0-9_\-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?))/g
  } as any

  converter: Record<string, string> = {}

  import(data: FilterDatabaseEntry[]) {
    for (const entry of data) {
      if (entry.type === FilterDatabaseEntryType.BaseFilter) {
        this.filters[entry.filter] = Object.keys(entry.filterData).reduce<
          JPBExp[]
        >((c, d) => {
          c.push(new JPBExp(d, entry.filterData[d]))

          return c
        }, [])
      } else if (entry.type === FilterDatabaseEntryType.RegExp) {
        this.regex[entry.name] = new RegExp(entry.regex, 'gi')
      } else if (entry.type === FilterDatabaseEntryType.Chars) {
        Object.keys(entry.chars).forEach((key) => {
          if (['-', '?'].includes(key)) return

          entry.chars[key].forEach((piece) => {
            this.converter[piece] = key
          })
        })
      }
    }
  }

  export(): FilterDatabaseEntry[] {
    const arr: FilterDatabaseEntry[] = []
    for (const key in this.filters) {
      arr.push({
        type: FilterDatabaseEntryType.BaseFilter,
        filter: key as baseFilters,
        filterData: this.filters[key as baseFilters]!.reduce((a, b) => {
          a[b._text] = b.uncensorText

          return a
        }, {})
      })
    }

    return arr
  }

  convert(text: string): string {
    return text
      .replace(this.regex.combining, '')
      .replace(/./g, (t) => {
        if (t.match(this.regex.replaceNothing)) return t
        if (t.match(this.regex.replaceSpaces)) return t

        return this.converter[t] || t
      })
      .toLowerCase()
  }

  surround(text: string, ranges: Range[], sur: string): string {
    text = text.replace(removeRegex, '').replace(/<a?:(\w+):(\d+)>/g, '$1') // emojis

    let links: string[] = []
    let splitText: string | string[] = text
      .replace(this.regex.both, (text) => {
        return `\x1D${links.push(text) - 1}`
      })
      .split(this.regex.replaceSpaces)
      .join(' ')

    while (splitText.startsWith(' ') || splitText.startsWith('\n')) {
      splitText = splitText.slice(1)
    }
    while (text.startsWith(' ') || text.startsWith('\n')) {
      text = text.slice(1)
    }

    for (const i in links) {
      splitText = splitText.replace('\x1D' + i, links[i])
    }

    splitText = splitText.split(' ')

    const starterPlaces: number[] = []
    const endPlaces: number[] = []

    ranges.forEach((range) => {
      starterPlaces.push(
        (splitText as string[]).slice(0, range[0]).join(' ').length
      )
      endPlaces.push(
        (splitText as string[]).slice(0, (range[1] ?? 0) + 1).join(' ').length
      )
    })

    links = []

    let newText = text
      .replace(this.regex.both, (text) => {
        links.push(text)
        return '\x1D'.repeat(text.length)
      })
      .replace(this.regex.replaceSpaces, (spot, ind) => {
        if (starterPlaces.includes(ind)) spot += '\x1F'
        if (endPlaces.includes(ind)) spot = '\x1F' + spot

        return spot
      })
      .replace(new RegExp(sur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
      .replace(/\x1F/g, sur)

    if (starterPlaces.includes(0)) newText = sur + newText
    if (endPlaces.includes(text.length)) newText += sur

    let i = -1

    return newText
      .replace(/\x1D+/, () => {
        i++
        return links[i]
      })
      .replace(/`/g, '')
  }

  resolve(content: string | string[]): ResolvedPiece[] {
    // base stuff
    content = (content as string)
      .toLowerCase()
      .replace(removeRegex, '')
      .replace(/<#?@?!?&?(\d+)>/g, '!') // mentions
      .replace(/<a?:(\w+):(\d+)>/g, '$1') // emojis
      .replace(this.regex.email, (...email: string[]) => {
        return `${email[1]}${email[2]}${email[6]}`.replace(
          this.regex.replaceSpaces,
          ''
        )
      })
      .replace(this.regex.link, (...link: string[]) => {
        return `${link[2]}`.replace(this.regex.replaceSpaces, '')
      })
      .replace(/(\w)\1{2,}/g, '$1$1') // multiple characters only come up once

    while (content.startsWith(' ') || content.startsWith('\n')) {
      content = content.slice(1)
    }

    content = this.convert(content) as string

    let res: ResolvedPiece[] = Array(
      content.split(this.regex.replaceSpaces).length + 1
    )
      .fill(null)
      .map(() => ({ i: [], t: '' })) // array of default objects

    content = content.split(this.regex.replaceSpaces)

    function addSpot(
      text: string,
      spot: number | Range,
      index: number
    ): boolean {
      if (!res[index]) return false
      res[index].t = text

      function checkSpots(s): void {
        // if indexes are outside of the range of the current spot, adjust the range
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

    for (let i = 0; i < content.length; i++) {
      // base index pushing to array
      const split = content[i]
        .replace(this.regex.replaceNothing, '')
        .split(this.regex.replaceSpaces)

      for (let spI = 0; spI < split.length; spI++) {
        nextPushes.push({ i: [i, i], t: split[spI], n: true })
        addSpot(split[spI], i, spotted)
        spotted++
      }
    }

    res = nextPushes.concat(res)

    for (let i = 0; i < res.length; i++) {
      // combine < 3 character bits together
      const s = res[i]
      if (firstShortWords.includes(s.t)) continue

      if (s.t && s.t.length < 3 && res[i + 1]) {
        if (s.n) continue
        if (addSpot(s.t + res[i + 1].t, s.i, i + 1)) {
          s.t = ''
          s.i = []
        }
      }
    }

    for (let i = res.length; i > -1; i--) {
      // combine < 3 character bits together but going backwards
      const s = res[i]
      if (!s || shortWords.includes(s.t)) continue

      if (s.t && s.t.length < 3 && res[i - 1]) {
        if (s.n ?? res[i - 1].n) continue
        if (addSpot(res[i - 1].t + s.t, s.i, i - 1)) {
          s.t = ''
          s.i = []
        }
      }
    }

    for (let i = 0; i < res.length; i++) {
      // combine pieces that ends and start with the same character
      const s = res[i]
      if (!s || firstShortWords.some((x) => s.t.endsWith(x))) continue

      if (s.t && res[i + 1] && s.t[s.t.length - 1] === res[i + 1].t[0]) {
        if (s.n) continue
        if (addSpot(s.t + res[i + 1].t, s.i, i + 1)) {
          s.t = ''
        }
      }
    }

    res = res.filter((x) => x.t) // remove any blank spaces

    return res
  }

  test(
    text: string,
    settings: FilterSettings,
    exceptions?: { server: boolean; prebuilt: boolean }
  ):
    | (FilterResultInfo & {
        type: FilterType.BaseFilter | FilterType.ServerFilter
      })
    | null {
    const content = this.resolve(text)

    let censor = false
    const res = {
      type: FilterType.BaseFilter,
      ranges: [],
      filters: [],
      places: []
    } as FilterResultInfo & {
      type: FilterType.BaseFilter | FilterType.ServerFilter
    } & { filters: string[] }

    const scanFor: {
      [key in baseFilters | 'server']?: JPBExp[]
    } = {}
    if (!exceptions?.server) {
      scanFor.server = settings.server.map((x) => new JPBExp(x))

      if (settings.phrases) {
        const phrases = settings.phrases.filter((x) =>
          text.toLowerCase().includes(x)
        )
        if (phrases.length > 0) {
          censor = true
          res.type = FilterType.ServerFilter
          res.places.push(...phrases)
          res.ranges.push([])
          return {
            type: FilterType.ServerFilter,
            ranges: [],
            places: phrases
          }
        }
      }

      if (settings.words) {
        const split = text.split(' ')

        settings.words.forEach((word, index) => {
          if (split.includes(word)) {
            censor = true

            res.type = FilterType.ServerFilter
            res.ranges.push([index, index])
            res.places.push(word)
          }
        })
      }
    }

    if (!exceptions?.prebuilt) {
      for (const filt in this.filters) {
        if (settings.base.includes(filt as baseFilters))
          scanFor[filt] = this.filters[filt]
      }
    }

    content.forEach((piece) => {
      if (
        res.ranges?.some(
          (x) =>
            x[0] !== undefined &&
            x[1] !== undefined &&
            inRange(x[0], piece.i[0] as number, piece.i[1] as number) &&
            inRange(x[1], piece.i[0] as number, piece.i[1] as number)
        )
      )
        return
      for (const key in scanFor) {
        for (const part of scanFor[key]) {
          if (!part.test(piece.t, settings.uncensor)) continue

          if (key === 'server') res.type = FilterType.ServerFilter

          censor = true
          res.ranges.push(piece.i)
          if (!res.filters.includes(key as baseFilters) && key !== 'server')
            res.filters.push(key as baseFilters)
          res.places.push(part)
        }
      }
    })

    if (res.type === FilterType.BaseFilter) {
      for (let i = 0; i < res.ranges.length; i++) {
        if (res.ranges[i + 1] && res.ranges[i][1] === res.ranges[i + 1][0]) {
          res.ranges[i + 1][0] = res.ranges[i][0]
          delete res.ranges[i]
        }
      }

      res.ranges = res.ranges.filter((x) => x).reverse()
    }

    return censor ? res : null
  }
}
