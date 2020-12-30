import { Logger } from "./Logger"

export class Utils {
  /**
   * Scroll to element on page
   * @param id ID of element
   */
  static scroll (id: string): void {
    const doc = document.getElementById(id)
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
      elm.onclick = (e) => {
        if (e.ctrlKey || elm.getAttribute('href') === "#") return

        e.preventDefault()

        Utils.setPath(elm.getAttribute('href'))
      }
    } else {
      document.querySelectorAll('[href], [clicky]').forEach((elm: HTMLElement) => {
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
        const button = document.createElement('a')
              button.classList.add('button')
              button.onclick = () => this.openWindow(url, text).then(x => resolve())
              button.innerText = text || 'Open'
        this.presentLoad(button)
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
   * @param msg Loading texth
   */
  static presentLoad (msg: string | HTMLElement): void {
    if (typeof msg === 'string') document.getElementById('loadtext').innerText = msg
    else {
      document.getElementById('loadtext').innerHTML = ''
      document.getElementById('loadtext').appendChild(msg)
    }
    document.getElementById('loader').removeAttribute('hidden')
  }

  /**
   * Stop loading screen
   */
  static stopLoad (): void {
    document.getElementById('loadtext').innerText = 'Loading...'
    document.getElementById('loader').setAttribute('hidden', '')
  }
}