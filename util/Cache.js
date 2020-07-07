const Collection = require('./Collection')

/**
 * Collection that deletes entries after a certain amount of time
 * @extends Collection
 */
class Cache extends Collection {
  /**
   * Cache
   * @param {Number} time Death rate in milliseconds
   */
  constructor (time) {
    super()

    /**
     * Death rate in milliseconds
     * @type {Number}
     */
    this.time = time

    /**
     * Timeout store
     * @type {Collection.<*, Timeout>}
     */
    this.timeouts = new Collection()
  }

  /**
   * Get
   * @param {*} key Get key
   */
  get (key) {
    if (!super.has(key)) return null

    this._resetTimer(key)

    return super.get(key)
  }

  /**
   * Set
   * @param {*} key Key
   * @param {*} val Value
   */
  set (key, val) {
    super.set(key, val)

    this._resetTimer(key)
  }

  _resetTimer (key) {
    if (this.timeouts.has(key)) return this.timeouts.get(key).refresh()
    this.timeouts.set(key, setTimeout(() => {
      super.delete(key)
      this.timeouts.delete(key)
    }, this.time))
  }

  delete (key) {
    super.delete(key)
    this.timeouts.delete(key)
  }
}

module.exports = Cache
