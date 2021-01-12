import { Page, PageInterface } from "../structures/Page";

import { Logger } from '../structures/Logger'

import Tagify from '@yaireo/tagify'

export class PremiumSettings extends Page implements PageInterface {
  name = 'premium_settings'
  url = /^\/dashboard\/premium$/

  fetchElements = [
    'ispremium',
    'notpremium',
    'premiumsetting',
    'current',
    'max',
    'save'
  ]
  
  async loading () {
    await this.api.getSelf()
    await this.api.getGuilds()
  }

  private get (): Snowflake[] {
    return this.util.getTagify(this.e('premiumsetting') as HTMLInputElement)
  }

  private async save () {
    const res = await this.api.postPremium(this.get())
    if (!res) return
    this.util.setTagify(res, this.registry.tag)
  }

  private updateCurrent () {
    this.e('current').innerText = this.get().length.toLocaleString()
  }

  async go () {
    const guilds = this.api.guilds
    const user = this.api.user
    if (!guilds || !user) return

    if (user.premium.count < 1) {
      this.log('Not premium')
      return this.e('notpremium').removeAttribute('hidden')
    } else {
      this.log('Is premium')
      this.e('ispremium').removeAttribute('hidden')
    }

    this.e('save').onclick = () => this.save()

    this.registry.tag = new Tagify(this.e('premiumsetting'), {
      whitelist: guilds.map(g => ({ value: g.n, id: g.i })),
      enforceWhitelist: true,
      maxTags: user.premium.count,
      dropdown: {
        enabled: 0,
        maxItems: guilds.length
      },
      callbacks: {
        add: () => this.updateCurrent(),
        remove: () => this.updateCurrent(),
        invalid: (e) => {
          if (e.detail.message === 'number of tags exceeded') return Logger.tell('Not enough premium servers.')
        }
      }
    })
    this.util.setTagify(user.premium.guilds, this.registry.tag)

    this.e('max').innerText = user.premium.count.toLocaleString()
    this.updateCurrent()
  }

  async remove () {
    return true
  }
}