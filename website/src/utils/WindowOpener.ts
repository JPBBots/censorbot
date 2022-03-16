export class WindowOpener {
  public window?: Window
  public closedByUser: boolean = true

  onFail?: () => Promise<boolean>
  onCancel: Array<() => void> = []
  private waitPromise?: Promise<void>
  private onPromiseDone?: () => void
  private interval?: NodeJS.Timer

  constructor(
    public url: string,
    private readonly params: string = 'width=600,height=1000'
  ) {}

  fail(onFail: this['onFail']) {
    this.onFail = onFail

    return this
  }

  cancel(onCancel: this['onCancel'][number]) {
    this.onCancel.push(onCancel)

    return this
  }

  async wait() {
    if (!this.waitPromise) {
      this.waitPromise = new Promise((resolve) => {
        this.onPromiseDone = resolve
      })
    }

    return await this.waitPromise
  }

  open() {
    let win = window.open(this.url, 'window', this.params)

    if (!win) {
      if (!this.onFail) return this

      void this.onFail().then((res) => {
        if (res) {
          win = window.open(this.url, 'window', this.params)

          if (!win) return null

          this._registerWindow(win)
        } else {
          this.onCancel.forEach((x) => x())

          return null
        }
      })

      return this
    }

    this._registerWindow(win)

    return this
  }

  close() {
    this.closedByUser = false
    this.window?.close()

    return this
  }

  clear() {
    if (this.interval) clearInterval(this.interval)

    return this
  }

  private _registerWindow(window: Window) {
    this.window = window

    this.interval = setInterval(() => {
      if (window.closed) {
        this.onPromiseDone?.()
        this.clear()
      }
    })
  }
}

if ('window' in global) global.WindowOpener = WindowOpener
