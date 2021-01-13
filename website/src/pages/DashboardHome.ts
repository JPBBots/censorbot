import { Page, PageInterface } from "../structures/Page";

export class DashboardHome extends Page implements PageInterface {
  name = 'dashboard_home'
  url = /^\/dashboard$/
  fetchElements = [
    'guilds'
  ]

  async loading () {
    await this.api.getGuilds()
    await this.api.waitForUser()
  }

  async go () {
    const guilds = this.api.guilds
    if (!guilds || !this.api.user) return

    this.log('Rendering guilds')

    guilds.forEach(guild => {
      const a = document.createElement('a')
            a.href = `/dashboard/${guild.i}`
            if (this.api.user.premium.guilds.includes(guild.i)) a.appendChild(this.util.createPremiumStar())
      const name = document.createElement('p')
            name.innerText = guild.n
      let icon
      if (guild.a) {
        icon = document.createElement('img')
        icon.src = guild.a ? `https://cdn.discordapp.com/icons/${guild.i}/${guild.a}.png` : 'https://cdn.discordapp.com/embed/avatars/1.png'
      } else {
        icon = document.createElement('h2')
        icon.innerText = guild.n.split(' ').slice(0, 3).reduce((a, b) => a + b[0], '')
      }
      a.appendChild(icon)
      a.appendChild(name)

      this.util.registerButtons(a)

      this.e('guilds').appendChild(a)
    })
  }

  async remove () {
    return true
  }
}