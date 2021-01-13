import { PageInterface } from "./structures/Page";
import { Logger } from './structures/Logger'
import { Collection } from './structures/Collection'
import { Utils } from './structures/Utils'
import { CensorBotApi } from './structures/Api'

import { Landing } from "./pages/Landing";
import { e404 } from "./pages/404"
import { Test } from './pages/Test'
import { DashboardHome } from './pages/DashboardHome'
import { GuildSettings } from './pages/GuildSettings'
import { PremiumSettings } from './pages/PremiumSettings'
import { DashboardTwitch } from './pages/DashboardTwitch'
import { Premium } from './pages/Premium'


export class Loader {
  private pages: Collection<string, PageInterface>
  private _currentPage: string

  public pageData: WebData

  public loading: boolean

  util = Utils
  api = new CensorBotApi()

  constructor (data?: WebData) {
    this.log('Loading...')
    if (data) this.pageData = data

    //

    history.onurlchange = () => this.updatePage()
    window.onpopstate = () => this.updatePage()

    //

    this.pages = new Collection()

    this.run()

    this.log('Loaded API: ' + CensorBotApi.url)
  }

  async run () {
    if (!this.pageData) this.pageData = await import('./web.json').then(x => x.default)

    if (window.dev) {
      Utils.addStyleSheet('/static/css/index.css')
    } else {
      document.getElementById('indcss').innerText = this.pageData.index.css
    }

    this.load()
    const firstPage = this.pathPage()

    this._loadPage(firstPage.name, true)
    
    this.pages.keyArray().filter(x => x !== firstPage.name).forEach(page => this._loadPage(page))
  }

  log (message: string) {
    Logger.log('LOGGER', message)
  }

  _loadPage (page: string, loadAfter?: boolean): void {
    const pg = this.pages.get(page)
    pg.register(this.pageData[pg.pageName])
    this.log(`Fetched HTML for ${pg.name}`)
    if (loadAfter) this.switchTo(pg.name)
  }

  pathPage (): PageInterface {
    return this.pages.find(x => x.matches()) || this.pages.get('404')
  }

  get currentPage (): PageInterface {
    return this.pages.get(this._currentPage)
  }

  load () {
    [Landing, e404, Test, DashboardHome, GuildSettings, PremiumSettings, DashboardTwitch, Premium]
      .forEach(Page => {
        const page = new Page(this)
        this.pages.set(page.name, page)
      })
  }

  get root (): HTMLElement {
    return document.getElementById('root')
  }

  async switchTo (page: string) {
    if (this.loading) return
    this.loading = true
    this.log(`Loading page ${page}`)
    const pg = this.pages.get(page)
    let loader
    if (pg.loading) loader = pg.loading()
    if (this.currentPage) {
      const res = await this.currentPage.remove()
      if (res === false) return this.log('Page didn\'t want to reload.')
      else this.currentPage.unrender()
    }
    this.root.classList.add('loading')
    await this.util.wait(200)
    Utils.scroll('nav')
    await pg.render()
    if (loader) await loader
    await pg.go()
    this.root.classList.remove('loading')
    this.log('Finished loading page')
    this.loading = false
    this._currentPage = page
  }

  updatePage () {
    this.switchTo(this.pathPage().name)
  }
}