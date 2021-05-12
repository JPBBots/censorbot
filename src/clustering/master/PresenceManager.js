const { custom: { customStatus } } = require('../../settings')

/**
 * Used for setting and updating bot presences
 */
class PresenceManager {
  /**
   * Presence manager
   * @param {Master} master Master
   */
  constructor (master) {
    /**
     * Master
     * @type {Master}
     */
    this.master = master

    /**
     * Presence currently selected
     * @type {String}
     */
    this.select = 'd'

    /**
     * Custom status content
     * @type {Array.<String>}
     * @property {String} [0] Type
     * @property {String} [1] Name
     * @property {String} [2] Status
     */
    this.customs = ['PLAYING', 'custom', 'online']
  }

  /**
   * Sets a new presence
   * @param {String} set Presence
   */
  set (set) {
    this.master.log(`Presence set to ${set}`)

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
    this.master.api.sendToAll('PRESENCE', opt)
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
  async d () {
    if (customStatus) {
      this.status(...customStatus)
    } else {
      const guilds = await this.master.api.sendToAll('GUILD_COUNT', {}, true)
      this.status('WATCHING', `For Bad Words | ${(guilds.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0)).toLocaleString()} Servers`)
    }
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
   * Non dev streaming
   */
  notdev () {
    this.status('STREAMING', 'My Creator', 'online', 'https://twitch.tv/jpbberry')
  }

  /**
   * rose
   */
  rose () {
    this.status('WATCHING', 'rose be a qt', 'online')
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

  /**
   * Limit
   */
  limit () {
    this.status('WATCHING', 'Limit being a dumby', 'online')
  }
  
   /**
   * Limit
   */
    limitstream () {
        this.status('STREAMING', 'Streaming with Limit', 'online', 'https://twitch.tv/no_limitrb')
      }
      
}




module.exports = PresenceManager
