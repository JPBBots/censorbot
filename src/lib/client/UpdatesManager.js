class UpdatesManager {
  /**
   * Updates Manager
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client

    /**
     * Updates
     * @type {Array.<Object>}
     */
    this.updates = []

    this.load()
  }

  /**
   * (Re)load updates
   */
  load () {
    delete require.cache[require.resolve('./Updates.json')]

    this.updates = require('./Updates.json')
  }

  /**
   * List updates
   */
  list () {
    return this.updates.map(x => {
      return {
        v: x.v,
        desc: x.desc,
        date: new Date(x.date)
      }
    })
  }

  /**
   * Get specific update
   * @param {String} v Version
   * @param {Boolean} browser Whether requested from browser
   */
  getUpdate (v, browser) {
    const update = this.updates.find(x => x.v === v)
    if (!update) return null

    if (browser) {
      update.points = update.points.map(x => {
        return x.replace(/{t:(.+):(.+)}/g, '<a href="https://trello.com/c/$1">$2</a>')
      })
    }

    update.date = new Date(update.date)

    return update
  }
}

module.exports = UpdatesManager
