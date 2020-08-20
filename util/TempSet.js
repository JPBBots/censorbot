class TempSet extends Set {
  constructor (time) {
    super()

    this._time = time

    this._timeouts = new Map()
  }

  add (value) {
    super.add(value)

    const timeout = this._timeouts.get(value)

    if (timeout) return timeout.refresh()

    this._timeouts.set(value, setTimeout(() => {
      super.delete(value)
      this._timeouts.delete(value)
    }, this._time))
  }
}

module.exports = TempSet
