class PresenceManager {
  constructor (client) {
    this.client = client
    this.client.log(0, 0, 'PresenceManager')

    this.select = null

    this.custom = ['PLAYING', 'custom', 'online']

    this.client.log(0, 1, 'PresenceManager')
  }

  set (set) {
    this.client.log(12, 17, set)
    this.select = set
    this.go()
  }

  go () {
    if (!this.select) return
    this[this.select]()
  }

  status (...opt) {
    this.client.setStatus(...opt)
  }

  setCustom (type = 'PLAYING', name = 'custom', status = 'online') {
    this.custom = [type, name, status]
    this.set('custom')
  }

  d () {
    this.status('WATCHING', `For Bad Words | ${this.client.guilds.size.toLocaleString()} Servers`)
  }

  err () {
    this.status('PLAYING', 'Some errors are happening', 'dnd')
  }

  slow () {
    this.status('PLAYING', 'Our servers are a little slow. Sorry for any inconvenience', 'idle')
  }

  streaming () {
    this.status('STREAMING', 'My Development', 'online', 'https://twitch.tv/jpbberry')
  }

  custom () {
    this.status(this.custom[0], this.custom[1], this.custom[2])
  }
}

module.exports = PresenceManager
