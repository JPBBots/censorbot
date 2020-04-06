/**
 * Used for setting and updating bot presences
 */
class PresenceManager {
  /**
   * Presence manager
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client
    this.client.log(0, 0, 'PresenceManager')

    /**
     * Presence currently selected
     * @type {?String}
     */
    this.select = null

    /**
     * Custom status content
     * @type {Array.<String>}
     * @property {String} [0] Type
     * @property {String} [1] Name
     * @property {String} [2] Status
     */
    this.customs = ['PLAYING', 'custom', 'online']

    this.client.log(0, 1, 'PresenceManager')
  }

  /**
   * Sets a new presence
   * @param {String} set Presence
   */
  set (set) {
    this.client.log(12, 17, set)
    this.select = set
    this.go()
  }

  /**
   * Updates current presence
   */
  go () {
    if (!this.select) return
    this[this.select]()
  }

  /**
   * Sets presence
   * @param  {...any} opt Presence object
   */
  status (...opt) {
    this.client.setStatus(...opt)
  }

  /**
   * Sets custom status
   * @param {String} type Type
   * @param {String} name Name
   * @param {String} status Status
   */
  setCustom (type = 'PLAYING', name = 'custom', status = 'online') {
    this.customs = [type, name, status]
    this.set('custom')
  }

  /**
   * Default
   */
  d () {
    this.status('WATCHING', `For Bad Words | ${this.client.guilds.size.toLocaleString()} Servers`)
  }

  /**
   * For errors
   */
  err () {
    this.status('PLAYING', 'Some errors are happening', 'dnd')
  }

  /**
   * Services are slow
   */
  slow () {
    this.status('PLAYING', 'Our servers are a little slow. Sorry for any inconvenience', 'idle')
  }

  /**
   * Development streaming
   */
  streaming () {
    this.status('STREAMING', 'My Development', 'online', 'https://twitch.tv/jpbberry')
  }

  /**
   * Restarting
   */
  restart () {
    this.status('PLAYING', 'Restarting...', 'dnd')
  }

  /**
   * Custom
   */
  custom () {
    this.status(this.customs[0], this.customs[1], this.customs[2])
  }
}

module.exports = PresenceManager
