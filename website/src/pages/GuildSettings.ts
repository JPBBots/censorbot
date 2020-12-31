import { Page, PageInterface } from "../structures/Page";
export class GuildSettings extends Page implements PageInterface {
  name = 'guild_settings'
  url = /^\/dashboard\/[0-9]+$/

  fetchElements = [
    'name'
  ]

  guild: GuildData = null

  get id () {
    return location.pathname.split('dashboard/')[1]
  }

  async loading () {
    this.guild = null
    const guild = await this.api.getGuild(this.id)
    if (guild) this.guild = guild
  }

  async go () {
    if (!this.guild) return

    this.e('name').innerHTML = this.guild.guild.n

    console.log(this.guild)
  }

  async remove () {
    return true
  }
}