import { PageInterface } from "./structures/Page";
import { Logger } from './structures/Logger'
import { Collection } from './structures/Collection'
import { Utils } from './structures/Utils'
import { CensorBotApi } from './structures/Api'

import { Pages } from './pages'

export class Loader {
  private pages: Collection<string, PageInterface>
  private _currentPage: string

  public pageData: WebData

  public loading: boolean

  chargebee: any = {}

  util = Utils
  api = new CensorBotApi(this)

  constructor () {
    this.log('Loading...')

    //

    history.onurlchange = () => this.updatePage()
    window.onpopstate = () => this.updatePage()

    //

    this.pages = new Collection()

    this.run()

    this.log('Loaded API: ' + CensorBotApi.url)
  }

  get staging () {
    return location.hostname.split('.')[0] === 'staging'
  }

  async run () {
    // @ts-ignore web.json only comes at compile time
    this.pageData = await import('./web.json').then(x => x.default)

    this.load()
    const firstPage = this.pathPage()

    this._loadPage(firstPage.name, true)
    
    this.pages.keyArray().filter(x => x !== firstPage.name).forEach(page => this._loadPage(page))
  }

  log (message: string) {
    Logger.log('LOADER', message)
  }

  _loadPage (page: string, loadAfter?: boolean): void {
    const pg = this.pages.get(page)
    pg.register(this.pageData[pg.pageName])
    if (loadAfter) this.switchTo(pg.name)
  }

  pathPage (): PageInterface {
    return this.pages.find(x => x.matches()) || this.pages.get('404')
  }

  get currentPage (): PageInterface {
    return this.pages.get(this._currentPage)
  }

  load () {
    Pages
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
    if (this.currentPage) {
      const res = await this.currentPage.remove()
      if (res === false) return this.log('Page didn\'t want to reload.')
      else this.currentPage.unrender()
    }
    scrollTo({
      left: 0,
      top: 0
    })

    if (pg.loading) await pg.loading()
    // this.root.classList.add('loading')
    // await this.util.wait(window.loadTime)
    await pg.render()
    await pg.go()
    // this.root.classList.remove('loading')
    // @ts-ignore
    window.gtag('config', 'UA-111382716-3', {
      page_path: window.location.pathname.replace(/[0-9]+$/, '')
    })
    this.log('Finished loading page')
    this.loading = false
    this._currentPage = page
    if (pg !== this.pathPage()) this.updatePage()
  }

  updatePage () {
    this.switchTo(this.pathPage().name)
  }
}