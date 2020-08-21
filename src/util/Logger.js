class Logger {
  /**
   * Logger
   */
  constructor (process) {
    /**
     * process name
     * @type {Number}
     */
    this.process = process
  }

  /**
   * Log to console
   * @param {String} message Log
   * @param {Boolean} error Whether error
   */
  log (message, error = false) {
    const d = new Date()
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const seconds = d.getSeconds()
    const ms = d.getMilliseconds()
    console[error ? 'error' : 'log'](`${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}.${ms < 10 ? `00${ms}` : ms < 100 ? `0${ms}` : ms} | ${this.separate(`${this.process}`, 11)} | ${message}`)
  }

  /**
   * Make all lines even
   * @param {String} str String
   * @param {Number} to What to seperate too
   */
  separate (str, to) {
    let res = str
    let sw = 1
    for (let i = 0; i < 100; i++) {
      if (sw === 1) res = res + ' '
      else res = ' ' + res

      if (res.length >= to) break

      sw = sw * -1
    }
    return res
  }
}

module.exports = Logger
