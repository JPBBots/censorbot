import { Page, PageInterface } from "../structures/Page";

import { Logger } from '../structures/Logger'

import Tagify from '@yaireo/tagify'

export class GuildSettings extends Page implements PageInterface {
  name = 'guild_settings'
  url = /^\/dashboard\/[0-9]+$/

  fetchElements = [
    'name',
    // settings
    'prefix',
    'log',
    'role',
    'channels',
    'dm',
    'invites',
    'multi',
    'fonts',
    'filters'
  ]

  private get guild (): GuildData {
    return this.registry.guild
  }

  get id () {
    return location.pathname.split('dashboard/')[1]
  }

  private pushSettings(obj) {

  }

  private elm (name: string) {
    return this.e(name).children[1]
  }

  async loading () {
    const guild = await this.api.getGuild(this.id)
    if (guild) this.registry.guild = guild
  }

  async go () {
    if (!this.guild) return

    this.e('name').innerHTML = this.guild.guild.n

    const db = this.guild.db

    // tags
    new Tagify(this.elm('channels'), {
      whitelist: this.guild.guild.c.map(x => ({ value: `#${x.name}`, id: x.id })),
      enforceWhitelist: true,
      maxTags: this.guild.premium ? Infinity : 0,
      callbacks: {
        invalid: (e) => {
          if (e.detail.message === 'number of tags exceeded') Logger.tell('You need premium to use this feature.')
        }
      },
      dropdown: {
        enabled: 0,
        maxItems: this.guild.guild.c.length
      }
    })

    const listSettings = {
      maxTags: this.guild.premium ? 500 : 150,
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

    new Tagify(this.elm('filters'), listSettings)
  }

  async remove () {
    return true
  }
}