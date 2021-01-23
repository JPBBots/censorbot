import { E } from './Elements'

export class Utils {
  /**
   * Scroll to element on page
   * @param query Query for element
   */
  static scroll (query: string): void {
    const doc = document.querySelector(query)
    if (!doc) return
    window.scrollTo(0, doc.getBoundingClientRect().top - 50)
  }

  /**
   * Set URL path
   * @param path Path to set to
   */
  static setPath (path:string = '/') {
    history.pushState({}, null, path + location.search)

    history.onurlchange()
  }

  static reloadPage () {
    history.onurlchange()
  }

  /**
   * Wait an amount of time promise
   * @param time Time to wait
   */
  static async wait (time: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => resolve(), time)
    })
  }

  /**
   * Register buttons
   */
  static registerButtons (elm?: HTMLElement) {
    if (elm) {
      if(['#', ''].includes(elm.getAttribute('href'))) return
      elm.onclick = (e) => {
        if (elm.hasAttribute('disabled')) return e.preventDefault()
        if (e.ctrlKey) return

        e.preventDefault()

        Utils.setPath(elm.getAttribute('href'))
      }
    } else {
      document.querySelectorAll('[href]:not([target]):not([function]), [clicky]').forEach((elm: HTMLElement) => {
        this.registerButtons(elm)
      })
    }
  }

  /**
   * Open a URL and wait for it to close
   * @param url The URL to open
   */
  static async openWindow (url: string, text?: string): Promise<void> {
    return new Promise(resolve => {
      const win = window.open(url, 'window', 'width=600,height=1000')
      if (!win) {
        this.presentLoad(E.create({
          elm: 'a',
          classes: ['button'],
          text: text || 'Open',
          events: {
            click: () => this.openWindow(url, text).then(x => resolve())
          }
        }) as HTMLElement)
        return
      }
      const interval = setInterval(() => {
        if (win.closed) {
          resolve()
          clearInterval(interval)
        }
      })
    })
  }

  /**
   * Present a loading screen
   * @param msg Loading text
   */
  static presentLoad (msg: string | HTMLElement): void {
    if (typeof msg === 'string') document.getElementById('loadtext').innerText = msg
    else {
      document.getElementById('loadtext').innerHTML = ''
      document.getElementById('loadtext').appendChild(msg)
    }
    document.getElementById('root').classList.add('loader')
    document.getElementById('loader').removeAttribute('hidden')
  }

  /**
   * Stop loading screen
   */
  static stopLoad (): void {
    document.getElementById('loadtext').innerText = 'Loading...'
    document.getElementById('loader').setAttribute('hidden', '')
    document.getElementById('root').classList.remove('loader')
  }

  /**
   * Adds a stylesheet to DOM
   * @param url URL for stylesheet
   * @param id Optional id for style element
   */
  static addStyleSheet (url: string, id?: string) {
    const style = document.createElement('link')
          style.rel = 'stylesheet'
          style.href = url
    if (id) style.id = id

    document.head.appendChild(style)
  }

  /**
   * Gets tagify data
   * @param elm Element
   */
  static getTagify (elm: HTMLInputElement): Array<any> {
    if (!elm.value) return []
    return JSON.parse(elm.value).map(x => x.id ?? x.value)
  }

  /**
   * Sets tagify data
   * @param array Array of ID's
   * @param tag Tag class
   */
  static setTagify (array: string[], tag: any) {
    tag.removeAllTags()
    if (tag.settings.whitelist.length > 0) {
      tag.settings.whitelist.filter(x => array.includes(x.id)).forEach(x => tag.addTags(x.value))
    } else {
      array.forEach(x => tag.addTags(x))
    }
  }

  /**
   * Gets the duration for a <Duration> element
   * @param inp Input element
   */
  static getDuration (inp: HTMLInputElement): number {
    const select = inp.parentElement.querySelector('select')
    if (select.value === '') return null
    return Number(inp.value) * Number(select.value)
  }

  /**
   * Sets the duration for a <Duration> element
   * @param inp Input element
   */
  static setDuration (inp: HTMLInputElement, value?: number): void {
    const select = inp.parentElement.querySelector('select')
    if (value === null) {
      inp.setAttribute('hidden', '')
      select.value = ''
    } else {
      const multiples: HTMLOptionElement[] = []
      for (let i = 0; i < select.children.length - 1; i++) multiples.push(select.children[i] as HTMLOptionElement)
      const currentTime = multiples.slice(1).reduce((a, b) => (Number((a as HTMLOptionElement).value) * Number(inp.max)) < value ? b : a, multiples[0]) as HTMLOptionElement
      select.value = currentTime.value
      inp.value = String(value / Number(currentTime.value))
    }
  }

  /**
   * Compare two values and see if they're equal
   * @param val1 Value 1 to compare against
   * @param val2 Value 2 to compare for
   */
  static isEqual (val1: any, val2: any): boolean {
    if (val1 === val2) return true
    if (Array.isArray(val1)) return val1.sort().join('!') === val2.sort().join('!')
    if (val1 && val2 && typeof val1 === 'object') return Object.keys(val1).every(key => this.isEqual(val1[key], val2[key]))
    if (val1 !== val2) return false
    return true
  }

  /**
   * Creates a premium star element
   */
  static createPremiumStar (): HTMLElement {
    return document.createRange().createContextualFragment(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#c2973a" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
    `).children[0] as HTMLElement
  }
}