import { Page, PageInterface } from "../structures/Page";
import { Utils } from "../structures/Utils";
import { E } from '../structures/Elements'

export class DashboardHome extends Page implements PageInterface {
  name = 'dashboard_home'
  url = /^\/dashboard$/
  fetchElements = [
    'guilds', 'ispremium', 'reset',
    'ptotal', 'pused'
  ]

  async loading () {
    await this.api.getGuilds()
    await this.api.waitForUser()
  }

  async go () {
    const guilds = this.api.guilds
    if (!guilds || !this.api.user) return

    if (this.api.user.premium.count > 0) {
      this.e('ispremium').removeAttribute('hidden')
      this.e('reset').onclick = async () => {
        if (!confirm('Are you sure? Doing this will remove all premium servers. Press OK to continue.')) return
        this.api.user.premium.guilds = []
        await this.api.postPremium([])
        Utils.reloadPage()
      }
    }
    this.e('ptotal').innerText = this.api.user.premium.count.toLocaleString()
    this.e('pused').innerText = this.api.user.premium.guilds.length.toLocaleString()

    this.log('Rendering guilds')

    E.set(this.e('guilds'), guilds.map(guild => ({
      elm: 'a',
      attr: {
        href: `/dashboard/${guild.i}`,
        title: guild.n
      },
      children: [
        this.api.user.premium.guilds.includes(guild.i) ? this.util.createPremiumStar() : null,
        guild.a
        ? {
          elm: 'img',
          attr: {
            src: `https://cdn.discordapp.com/icons/${guild.i}/${guild.a}.png`,
            alt: guild.n
          }
        }
        : {
          elm: 'h2',
          text: guild.n.split(' ').slice(0, 3).reduce((a, b) => a + b[0], '')
        },
        {
          elm: 'p',
          text: guild.n
        }
      ],
      created: (elm) => {
        this.util.registerButtons(elm)
      }
    })))
  }

  async remove () {
    return true
  }
}