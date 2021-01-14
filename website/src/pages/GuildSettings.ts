import { Page, PageInterface } from "../structures/Page";

import { Logger } from '../structures/Logger'

import Config from '../config.json'

const defaultConfig = JSON.stringify(Config)

import Tagify from '@yaireo/tagify'
import { Utils } from "../structures/Utils";

export class GuildSettings extends Page implements PageInterface {
  name = 'guild_settings'
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
    'prefix',
    'log',
    'role',
    'channels',
    'dm',
    'nsfw',
    'invites',
    'multi',
    'fonts',
    'filters',
    'filter',
    'uncensor',
    'censor.msg',
    'censor.emsg',
    'censor.nick',
    'censor.react',
    'punishment.amount',
    'punishment.expires',
    'punishment.role',
    'punishment.type',
    'punishment.time',
    'msg.deleteAfter',
    'msg.content',
    'webhook.enabled',
    'webhook.separate',
    'webhook.replace'
  ]

  private get guild (): ExtendedGuild {
    return this.registry.guild.guild
  }

  private get premium (): boolean {
    return this.registry.guild.premium
  }

  private get db (): GuildSettings {
    return this.registry.db
  }

  get id () {
    return location.pathname.split('dashboard/')[1]
  }

  private formSettings (): GuildDB {
    const res: GuildDB = JSON.parse(defaultConfig)

    res.prefix = this.elm('prefix').value || null
    res.log = this.elm('log').value || null
    res.role = this.elm('role').value || null
    res.channels = this.util.getTagify(this.inp('channels'))
    res.dm = this.inp('dm').checked

    res.invites = this.inp('invites').checked
    res.multi = this.inp('multi').checked
    res.fonts = this.inp('fonts').checked
    res.nsfw = this.inp('nsfw').checked
    res.filters = this.util.getTagify(this.inp('filters'))
    res.filter = this.util.getTagify(this.inp('filter'))
    res.uncensor = this.util.getTagify(this.inp('uncensor'))
    res.censor.msg = this.inp('censor.msg').checked
    res.censor.emsg = this.inp('censor.emsg').checked
    res.censor.nick = this.inp('censor.nick').checked
    res.censor.react = this.inp('censor.react').checked

    res.punishment.amount = Number(this.elm('punishment.amount').value)
    res.punishment.expires = this.util.getDuration(this.inp('punishment.expires'))
    res.punishment.type = Number(this.elm('punishment.type').value) as GuildDB['punishment']['type']
    if (res.punishment.type === 1) {
      res.punishment.role = this.elm('punishment.role').value
      if (res.punishment.role === '') res.punishment.role = null
    }
    if ([1, 3].includes(res.punishment.type)) {
      res.punishment.time = this.util.getDuration(this.inp('punishment.time'))
    }

    res.msg.content = this.elm('msg.content').value || null
    if (res.msg.content === 'Default') res.msg.content = null
    if (res.msg.content === 'Off') res.msg.content = false
    res.msg.deleteAfter = Number(this.elm('msg.deleteAfter').value)
    if (res.msg.deleteAfter) res.msg.deleteAfter*=1000
    else res.msg.deleteAfter = null

    res.webhook.enabled = this.inp('webhook.enabled').checked
    res.webhook.separate = this.inp('webhook.separate').checked
    res.webhook.replace = Number(this.elm('webhook.replace').value) as GuildDB['webhook']['replace']

    return res
  }

  private pushSettings(obj: GuildDB): void {
    delete obj.id
    this.registry.db = obj
    this.elm('prefix').value = obj.prefix
    this.elm('log').value = obj.log || ""
    this.elm('role').value = obj.role || ""
    this.util.setTagify(obj.channels, this.registry.tags.get('channels'))
    this.inp('dm').checked = obj.dm

    this.inp('invites').checked = obj.invites
    this.inp('multi').checked = obj.multi
    this.inp('fonts').checked = obj.fonts
    this.inp('nsfw').checked = obj.nsfw
    this.util.setTagify(obj.filters, this.registry.tags.get('filters'))
    this.util.setTagify(obj.filter, this.registry.tags.get('filter'))
    this.util.setTagify(obj.uncensor, this.registry.tags.get('uncensor'))
    this.inp('censor.msg').checked = obj.censor.msg
    this.inp('censor.emsg').checked = obj.censor.emsg
    this.inp('censor.nick').checked = obj.censor.nick
    this.inp('censor.react').checked = obj.censor.react

    this.inp('punishment.amount').value = String(obj.punishment.amount)
    this.util.setDuration(this.inp('punishment.time'), obj.punishment.time)
    this.elm('punishment.type').value = String(obj.punishment.type)
    this.elm('punishment.role').value = String(obj.punishment.role)
    this.util.setDuration(this.inp('punishment.expires'), obj.punishment.expires)

    if (obj.msg.content === null) this.inp('msg.content').value = 'Default'
    else if (obj.msg.content === false) this.inp('msg.content').value = 'Off'
    else this.inp('msg.content').value = obj.msg.content
    this.inp('msg.deleteAfter').value = obj.msg.deleteAfter ? String(obj.msg.deleteAfter / 1000) : ''

    this.inp('webhook.enabled').checked = obj.webhook.enabled
    this.inp('webhook.separate').checked = obj.webhook.separate
    this.elm('webhook.replace').value = String(obj.webhook.replace)

    this.elm('settings').querySelectorAll('input, select').forEach((x: HTMLElement) => x.onchange ? x.onchange(null): null)

    this.updateButton()
  }

  private elm (name: string): HTMLInputElement | HTMLSelectElement {
    return this.e(name).querySelector('input, select')
  }

  private inp (name: string): HTMLInputElement {
    return this.e(name).querySelector('input')
  }

  async loading () {
    const guild = await this.api.getGuild(this.id)
    if (guild) this.registry.guild = guild
    await this.api.waitForUser()
  }

  private get changed (): boolean {
    return !this.util.isEqual(this.registry.db, this.formSettings())
  }

  private updateButton () {
    setTimeout(() => {
      if (this.changed) this.e('save').removeAttribute('hidden')
      else this.e('save').setAttribute('hidden', '')
    }, 100)
  }

  private async save () {
    const res = await this.api.postSettings(this.id, this.formSettings())
    if (!res) return
    this.pushSettings(res)
  }

  private setPremium () {
    (this.e('premium') as HTMLInputElement).checked = true

    this.e('name').innerText += ' '
    this.e('name').appendChild(this.util.createPremiumStar())
  }

  private updatePremium () {
    this.e('pused').innerText = this.api.user.premium.guilds.length.toLocaleString()
  }

  async go () {
    if (!this.registry.guild || !this.api.user) return

    this.util.presentLoad('Getting your settings')

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
          if (guilds && guilds.includes(this.id)) {
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
          if (guilds && !guilds.includes(this.id)) {
            premium.checked = false
            this.registry.guild.premium = false
            this.save()
          }
        }
      }
      this.updatePremium()
    })

    this.registry.tags = new Map()

    const listSettings = {
      maxTags: this.premium ? 1500 : 150,
      delimiters: /,|\s/g,
      pattern: /^.{1,20}$/,
      callbacks: {
        invalid: (e) => {
          console.log(`Error whilst adding tag: ${e.detail.message}`)
          if (e.detail.message == "pattern mismatch") Logger.tell('Word cannot be over 20 characters long.')
          if (e.detail.message == "number of tags exceeded") Logger.tell("Reached max words. Get premium to get up to 500!")
        } // TODO: make it so that this pops up above the input instead of an alert
      }
    }

    // tags
    this.registry.tags
      .set('channels', new Tagify(this.elm('channels'), {
        whitelist: this.guild.c.map(x => ({ value: `#${x.name}`, id: x.id })),
        enforceWhitelist: true,
        maxTags: this.premium ? Infinity : 0,
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
    this.guild.c.forEach(channel => {
      const option = document.createElement('option')
            option.value = channel.id
            option.innerText = `#${channel.name}`
      
      this.elm('log').appendChild(option)
    })

    this.guild.r.forEach(role => {
      [this.elm('role'), this.elm('punishment.role')].forEach(elm => {
        const option = document.createElement('option')
              option.value = role.id
              option.innerText = `@${role.name}`
        elm.appendChild(option)
      })
    })

    if (this.premium) this.setPremium()

    document.querySelectorAll('[premium]').forEach(setting => {
      setting.querySelectorAll('input, select').forEach(elm => {
        elm.addEventListener('click', (event) => {
          if (!this.premium) {
            event.preventDefault()
            Logger.tell('You need premium to use this feature.')
            this.updateButton()
          }
        })
      })
    })

    this.pushSettings(this.registry.guild.db)
    this.e('save').onclick = () => this.save()
    this.on('keyup', () => this.updateButton())
    this.on('click', () => this.updateButton())
    this.on('change', () => this.updateButton())
    this.registry.interval = setInterval(() => {
      this.updateButton()
    }, 5000)
    await this.util.wait(500)
    this.util.stopLoad()
  }

  async remove () {
    clearInterval(this.registry.interval)
    return true
  }
}