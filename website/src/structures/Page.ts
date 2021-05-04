import { Logger } from '../structures/Logger'
import { Utils } from './Utils'
import { events } from './Events'
import { Loader } from '../Loader'
import { CensorBotApi } from './Api'

class PageClass {
  /**
   * Name of page
   */
  public name: string
  /**
   * location.pathname regex match
   */
  public url?: RegExp = null
  /**
   * Page to register with
   */
  public _pageName: string
  /**
   * Array of elements to fetch at render
   */
  public fetchElements: Array<string> = []
  /**
   * Page registry for caching data, cleared when unrendered
   */
  public registry: any = {}

  public loader: Loader
  public api: CensorBotApi

  util = Utils

  private data: PageData
  private elements: object = {}

  constructor (loader: Loader) {
    this.loader = loader

    this.api = this.loader.api
  }

  get pageName () {
    return this._pageName || this.name
  }

  e (id: string): HTMLElement {
    return this.elements[id]
  }

  on (name: string, fn: (data: any) => void) {
    events.addEventListener(this.name, name, fn)
  }

  /**
   * Log something to console
   */
  log (message: string) {
    Logger.log(`PG.${this.name.toUpperCase()}`, message)
  }

  /**
   * Register HTML text
   */
  register (data: PageData) {
    this.data = data || { html: '', css: null }
  }
  
  matches (): boolean {
    if (!this.url) return false
    return !!location.pathname.match(this.url)
  }
  
  async render () {
    document.getElementById('root').innerHTML = ''
    document.getElementById('css').innerText = this.data.css || ''
    document.getElementById('root').innerHTML = this.data.html
    this.fetchElements.forEach(elm => {
      this.elements[elm] = document.getElementById(elm)
    })
    this.util.registerButtons()
    this.log('Rendered')
  }

  unrender () {
    // 
    this.log('Unrendered')
    this.elements = {}
    this.registry = {}
    events.removeEventListener(this.name)
  }
}

export interface PageInterface extends PageClass {
  /**
   * Ran when page is loaded
   */
  go (): Promise<any>
  /**
   * Ran when loading 
   */
  loading? (): Promise<void>
  /**
   * Ran when page is unloaded
   */
  remove (): Promise<boolean>

  onConnect? (): void|Promise<void>
}

export const Page = PageClass