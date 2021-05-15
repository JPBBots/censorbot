import { Page, PageInterface } from "../../../structures/Page";

import { Logger } from '../../../structures/Logger'
import { E } from '../../../structures/Elements'

// @ts-ignore Only done when built properly
import Config from '../../../config.json'

const defaultConfig = JSON.stringify(Config)

import Tagify from '@yaireo/tagify'
import { Utils } from "../../../structures/Utils"
import { ExtendedGuild, GuildDB } from "@typings/api"
import { Snowflake } from "discord-api-types"
import { WebSocketEventMap } from "@typings/websocket";

function generatePieces (obj: any): any {
  const pieces = {}
  function generatePiece (toObj: any, key: string, working?: string) {
    const val = key ? toObj[key] : toObj
    if (!val || val.constructor !== Object) {
      pieces[`${working ? `${working}.` : ''}${key}`] = val
    } else {
      Object.keys(val).forEach(x => generatePiece(val, x, `${working ? `${working}.` : ''}${key}`))
    }
  }
  generatePiece(obj, '')

  return pieces
}

function wide (obj: any) {
  const res = {}
  const add = (key: string, addTo: any, value: any) => {
    if (key.includes('.')) {
      const split = key.split('.')
      const piece = split.shift()
      if (!addTo[piece]) addTo[piece] = {}
      add(split.join('.'), addTo[piece], value)
    } else {
      addTo[key] = value
    }
  }

  Object.keys(obj).forEach(key => {
    add(key, res, obj[key])
  })

  return res
}

const settings = [
  'prefix',
  'log',
  'role',
  'channels',
  'dm',
  'nsfw',
  'invites',
  'multi',
  'toxicity',
  'images',
  'filters',
  'filter',
  'uncensor',
  'matchExact',
  'censor',
  'punishment.amount',
  'punishment.expires',
  'punishment.role',
  'punishment.type',
  'punishment.time',
  'punishment.retainRoles',
  'msg.deleteAfter',
  'msg.content',
  'webhook.enabled',
  'webhook.separate',
  'webhook.replace',
  'antiHoist'
] as const

interface SettingType {
  bools: { elm: HTMLInputElement, val: boolean}
  select: { elm: HTMLSelectElement, val: string }
  duration: { elm: any, val: number }
  list: { elm: any, val: string[] }
  input: { elm: HTMLInputElement, val: string }
  number: { elm: HTMLInputElement, val: number }
  bitwise: { elm: HTMLDivElement, val: number }
}

export class DiscordSettings extends Page implements PageInterface {
  name = 'settings_discord'
  url = /^\/dashboard\/[0-9]+$/

  fetchElements = [
    'settings',
    'name',
    'save',
    // premium
    'pused',
    'ptotal',
    'premium',
    // settings
    ...settings
  ]
  needsAuth = true

  settingTag = false

  private types: {
    [key in keyof SettingType]: Array<typeof settings[number]>
  } = {
    bools: [
      'dm', 'nsfw', 'multi', 'invites', 'toxicity', 'images',
      'webhook.enabled', 'webhook.separate', 'matchExact', 'antiHoist',
      'punishment.retainRoles'
    ],
    select: ['log', 'punishment.role'],
    duration: ['punishment.expires', 'punishment.time'],
    list: ['filter', 'uncensor', 'filters', 'channels', 'role'],
    input: ['msg.content', 'prefix'],
    number: ['punishment.amount', 'msg.deleteAfter', 'webhook.replace', 'punishment.type'],
    bitwise: ['censor']
  }

  private get guild (): ExtendedGuild {
    return this.registry.guild.guild
  }

  private get premium (): boolean {
    return this.registry.guild.premium
  }

  get id () {
    return location.pathname.split('dashboard/')[1] as Snowflake
  }

  setters: {
    [key in keyof SettingType]: (value: SettingType[key]['val'], elm: SettingType[key]['elm']) => void
  } = {
    bools: (value, elm) => {
      elm.checked = value
    },
    input: (value, elm) => {
      if (value === null) value = 'Default'
      if ((value as any) === false) value = 'Off'
      elm.value = value
    },
    number: (value, elm) => {
      elm.value = String(value)
    },
    select: (value, elm) => {
      elm.value = value === null ? "" : value
    },
    duration: (value, elm) => {
      this.util.setDuration(elm, value)
    },
    list: (value, elm) => {
      this.settingTag = true
      this.util.setTagify(value, elm)
      this.settingTag = false
    },
    bitwise: (value, elm) => {
      elm.querySelectorAll('input').forEach(bit => {
        const num = Number(bit.parentElement.parentElement.id.split('.').pop())

        bit.checked = (value & num) !== 0
      })
    }
  }

  getters: {
    [key in keyof SettingType]: (elm: SettingType[key]['elm']) => SettingType[key]['val'] |  null | false
  } = {
    bools: (elm) => {
      return elm.checked
    },
    input: (elm) => {
      if (elm.value === 'Off') return false
      if (elm.value === 'Default') return null
      return elm.value
    },
    number: (elm) => {
      return Number(elm.value)
    },
    select: (elm) => {
      if (elm.value === '') return null
      return elm.value
    },
    duration: (elm) => {
      return this.util.getDuration(elm)
    },
    list: (elm) => {
      return elm.value.reduce((a, b) => a.concat([b.id || b.value]), [])
    },
    bitwise: (elm) => {
      let res = 0
      elm.querySelectorAll('input').forEach(bit => {
        const num = Number(bit.parentElement.parentElement.id.split('.').pop())

        if (bit.checked) {
          res |= num
        }
      })

      return res
    }
  }
  
  event: {
    [key in keyof SettingType]: (elm: SettingType[key]['elm'], fn: () => void) => void
  } = {
    bools: (elm, fn) => {
      elm.addEventListener('change', fn)
    },
    input: (elm, fn) => {
      elm.addEventListener('change', fn)
    },
    number: (elm, fn) => {
      elm.addEventListener('change', fn)
    },
    select: (elm, fn) => {
      elm.addEventListener('change', fn)
    },
    duration: (elm, fn) => {
      elm.parentElement.querySelectorAll('input, select').forEach(elm => {
        elm.addEventListener('change', fn)
      })
    },
    list: (elm, fn) => {
      elm.on('change', async () => {
        if (this.settingTag) return
        fn()
      })
    },
    bitwise: (elm, fn) => {
      elm.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('change', fn)
      })
    }
  }

  _elementFromType (type: keyof SettingType, piece: typeof settings[number]) {
    let elm: HTMLElement

    switch (type) {
      case 'list':
        elm = this.registry.tags.get(piece)
        break
      case 'bools':
      case 'duration':
        elm = this.e(piece).querySelector('input')
        break
      case 'bitwise':
        elm = this.e(piece)
        break
      default:
        elm = this.elm(piece)
        break
    }

    return elm
  }

  formSetting (setting: typeof settings[number]) {
    const type = this._getType(setting)
    if (!type) return

    let value = this.getters[type](this._elementFromType(type, setting))

    if (setting === 'msg.deleteAfter') (value as number) *= 1000

    return value
  }

  private formSettings (): GuildDB {
    const res = {}

    settings.forEach(key => {
      res[key] = this.formSetting(key)
    })

    return wide(res) as GuildDB
  }

  private _getType (set: string): keyof SettingType {
    return Object.keys(this.types).find(x => this.types[x].includes(set)) as keyof SettingType
  }

  private pushSettings (obj: GuildDB): void {
    delete obj.id
    delete obj.notInDb

    const pieces: {
      [key in typeof settings[number]]: any
    } = generatePieces(obj)

    Object.keys(pieces).forEach((piece: typeof settings[number]) => {
      const type = this._getType(piece)
      if (!type) return

      let value = pieces[piece]

      if (piece === 'msg.deleteAfter') value /= 1000

      this.setters[type](value as never, this._elementFromType(type, piece))
    })
  }

  private elm (name: string): HTMLInputElement | HTMLSelectElement {
    return this.e(name).querySelector('input, select')
  }

  async loading () {
    const guild = await this.api.getGuild(this.id)
    if (guild) this.registry.guild = guild
  }

  private async save () {
    await this.api.postSettings(this.id, this.formSettings())
  }

  private setPremium () {
    (this.e('premium') as HTMLInputElement).checked = true

    this.e('name').innerText += ' '
    this.e('name').appendChild(this.util.createPremiumStar())

    this.registry.tags.get('channels').settings.maxTags = Infinity
    this.registry.tags.get('filter').settings.maxTags = 1500
    this.registry.tags.get('uncensor').settings.maxTags = 1500
    this.registry.tags.get('role').settings.maxTags = Infinity

    this.elm('msg.content').setAttribute('maxlength', '1000')
    this.elm('msg.deleteAfter').setAttribute('max', '600')
  }

  private clearPremium () {
    (this.e('premium') as HTMLInputElement).checked = false

    this.e('name').innerText = this.guild.n

    this.registry.tags.get('channels').settings.maxTags = 5
    this.registry.tags.get('filter').settings.maxTags = 150
    this.registry.tags.get('uncensor').settings.maxTags = 150
    this.registry.tags.get('role').settings.maxTags = 4

    this.elm('msg.content').setAttribute('maxlength', '200')
    this.elm('msg.deleteAfter').setAttribute('max', '120')
  }

  private updatePremium () {
    this.e('pused').innerText = this.api.user.premium.guilds.length.toLocaleString()
  }

  async go () {
    if (!this.registry.guild || !this.api.user) return

    this.e('name').innerHTML = this.guild.n

    this.e('ptotal').innerText = this.api.user.premium.count.toLocaleString()
    this.updatePremium()

    const premium = this.e('premium') as HTMLInputElement
    const premUser = this.api.user.premium
    premium.addEventListener('click', async (event) => {
      event.preventDefault()
      if (premium.checked) {
        if (premUser.count < 1) {
          Utils.setPath('/premium')
        } else if (premUser.guilds.length + 1 > premUser.count) {
          Logger.tell('Out of premium server slots!')
        } else if (premUser.guilds.includes(this.id)) {
          Logger.tell('This server is already premium.')
        } else {
          this.log('Adding premium server')
          const newGuilds = premUser.guilds.concat([this.id])
          const guilds = await this.api.postPremium(newGuilds)
          if (guilds) {
            premium.checked = true
            this.registry.guild.premium = true
            this.setPremium()
          }
        }
      } else {
        if (!premUser.guilds.includes(this.id)) {
          Logger.tell('You did not give this server premium, therefore you cannot take it away.')
        } else {
          if (!confirm('Press OK to continue, doing this will disable all enabled premium features on this server.')) return
          this.log('Removing premium server')
          const newGuilds = premUser.guilds.filter(x => x !== this.id)
          const guilds = await this.api.postPremium(newGuilds)
          if (guilds) {
            premium.checked = false
            this.registry.guild.premium = false
            this.clearPremium()
            this.save()
          }
        }
      }
      this.updatePremium()
    })

    this.registry.tags = new Map()

    const listSettings = {
      delimiters: /,|\s/g,
      pattern: /^.{1,20}$/,
      callbacks: {
        invalid: (e) => {
          this.log(`Error whilst adding tag: ${e.detail.message}`)
          if (e.detail.message == "pattern mismatch") Logger.tell('Word cannot be over 20 characters long.')
          if (e.detail.message == "number of tags exceeded") Logger.tell("Reached max words. Get premium to get up to 1500!")
        } // TODO: make it so that this pops up above the input instead of an alert
      }
    }

    // tags
    this.registry.tags
      .set('channels', new Tagify(this.elm('channels'), {
        whitelist: this.guild.c.map(x => ({ value: `#${x.name}`, id: x.id })),
        enforceWhitelist: true,
        callbacks: {
          invalid: (e) => {
            if (e.detail.message === 'number of tags exceeded') Logger.tell('You need premium to use this feature.')
          }
        },
        dropdown: {
          enabled: 0,
          maxItems: this.guild.c.length
        }
      }))
      .set('role', new Tagify(this.elm('role'), {
        whitelist: this.guild.r.map(x => ({ value: `@${x.name}`, id: x.id })),
        enforceWhitelist: true,
        callbacks: {
          invalid: (e) => {
            if (e.detail.message === 'number of tags exceeded') Logger.tell('You need premium to get more ignored role slots.')
          }
        },
        dropdown: {
          enabled: 0,
          maxItems: this.guild.r.length
        }
      }))
      .set('filters', new Tagify(this.elm('filters'), {
        whitelist: [
          { id: "en", value: "English" },
          { id: "es", value: "Spanish" },
          { id: "off", value: "Offensive" },
          { id: 'de', value: 'German (BETA)' },
          { id: 'ru', value: 'Russian (BETA)' }
        ],
        enforceWhitelist: true,
        callbacks: {},
        dropdown: {
          enabled: 0
        }
      }))
      .set('filter', new Tagify(this.elm('filter'), listSettings))
      .set('uncensor', new Tagify(this.elm('uncensor'), listSettings))

    // fills 
    E.set(this.elm('log'), this.guild.c.map(c => ({
      elm: 'option',
      text: `#${c.name}`,
      attr: {
        value: c.id
      }
    })), true)

    E.set([this.elm('role'), this.elm('punishment.role')], this.guild.r.map(r => ({
      elm: 'option',
      text: `@${r.name}`,
      attr: {
        value: r.id
      }
    })), true)

    if (this.premium) this.setPremium()
    else this.clearPremium()

    document.querySelectorAll('[premium]').forEach(setting => {
      setting.querySelectorAll('input, select').forEach(elm => {
        elm.addEventListener('click', (event) => {
          if (!this.premium) {
            event.preventDefault()
            Logger.tell('You need premium to use this feature.')
          }
        })
      })
    })

    const special = {
      'msg.content': (fn: () => void) => {
        this.elm('msg.content').addEventListener('change', (elm) => {
          if ((elm.target as HTMLInputElement).value === '') {
            (elm.target as HTMLInputElement).value = 'Default'
          }
          fn()
        })
        this.e('msg.content').querySelectorAll('a').forEach(elm => {
          elm.addEventListener('click', () => {
            fn()
          })
        })
      }
    }

    settings.forEach(setting => {
      const type = this._getType(setting)
      if (!type) return

      const fn = async () => {
        const obj = {}
        obj[setting] = this.formSetting(setting)

        await this.api.postSettings(this.id, wide(obj) as GuildDB)
      }

      if (special[setting]) return special[setting](fn)

      this.event[type](this._elementFromType(type, setting), fn)
    })

    this.pushSettings(this.registry.guild.db)
    this.e('settings').querySelectorAll('input, select').forEach((x: HTMLElement) => x.onchange ? x.onchange(null): null)

    await this.util.wait(500)
  }

  public intakeUpdate (data: WebSocketEventMap['CHANGE_SETTING']['receive']) {
    this.pushSettings(data.data)
  }

  onConnect () {
    this.api.getGuild(this.id)
  }

  async remove () {
    clearInterval(this.registry.interval)
    return true
  }
}