class Wait {
  constructor (time) {
    this.time = time
  }

  wait () {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, this.time)
    })
  }
}

module.exports = Wait
