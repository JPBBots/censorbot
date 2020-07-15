const WS = require('ws')
const EventEmitter = require('events')

/**
 * Discord websocket broker for individual shards
 * @extends EventEmitter
 */
class DiscordWebsocket extends EventEmitter {
  /**
   * Websocket for connecting to the Discord WebSocket
   * @param {Shard} shard Initiating shard
   */
  constructor (shard) {
    super()
    /**
     * Shard
     * @type {Shard}
     */
    this.shard = shard

    /**
     * Client
     * @type {Client}
     */
    this.client = shard.client

    /**
     * Websocket Client
     * @type {?Websocket}
     */
    this.ws = null

    /**
     * Heartbeat
     * @type {?Timeout}
     */
    this.hbInterval = null

    /**
     * Whether or not websocket is awaiting a heartbeat ack
     * @type {Boolean}
     */
    this.waitingHeartbeat = false

    /**
     * Last event ID
     * @type {?Number}
     */
    this.s = null

    /**
     * Session ID
     * @type {?String}
     */
    this.sessionID = null

    /**
     * Whether ws is reconnecting
     * @type {Boolean}
     */
    this.reconnecting = false

    /**
     * Whether ws is in a state for receiving events
     * @type {Boolean}
     */
    this.connected = false

    /**
     * Timeout for making sure ws is connected
     * @type {?Timeout}
     */
    this.connectTimeout = null

    /**
     * Whether is resuming because of dispatched op 7
     * @type {Boolean}
     */
    this.op7 = false

    /**
     * Heartbeat retention
     * @type {Number}
     */
    this.retention = 0
  }

  get opened () {
    if (!this.ws) return
    return this.ws.readyState === WS.OPEN
  }

  /**
   * Sets up ws
   */
  setup () {
    this.ws = new WS(this.client.options.ws.url)

    this.connected = false

    this.connectTimeout = setTimeout(() => {
      if (this.connected) return

      this.client.killShard(this.shard.id)
    }, 30000)

    this.ws.on('message', (data) => {
      this.message(data)
    })
    this.ws.on('open', () => {
      this.open()
    })
    this.ws.on('close', (code, reason) => {
      this.close(code, reason)
    })
  }

  /**
   * Handles message from websocket
   * @param {String} data Raw event data
   */
  message (data) {
    const msg = JSON.parse(data)
    if (msg.s) this.s = msg.s

    if (['READY', 'RESUMED'].includes(msg.t)) {
      this.connected = true
      clearTimeout(this.connectTimeout)
    }
    if (msg.t === 'RESUMED') {
      if (this.op7) this.op7 = false
      this.client.log(`Shard ${this.shard.id} resumed`)
    }

    if (msg.t === 'READY') this.sessionID = msg.d.session_id
    if (['GUILD_CREATE', 'READY'].includes(msg.t)) return this.emit(msg.t, msg.d)

    this.client.emit(msg.t, msg.d || msg, this)

    if (msg.op === 7) {
      this.op7 = true
      this.ws.close()
    }
    if (msg.op === 9) {
      this.reconnecting = msg.d
      this.client.log(`Shard ${this.shard.id} failed to resume. Trying again. Resuming: ${msg.d}`, true)
      setTimeout(() => {
        this.hello()
      }, Math.ceil(Math.random() * 5) * 1000)
    }
    if (msg.op === 10) this.hello(msg)
    if (msg.op === 11) this.ack()
  }

  /**
   * Handles open from websocket
   */
  open () {
    this.client.log(`Shard ${this.shard.id} starting`)
  }

  /**
   * Handles close from websocket
   * @param {Number} code Close code
   * @param {String} reason Close reason
   */
  close (code, reason) {
    this.client.log(`Shard ${this.shard.id} closed with code: ${code} and reason: ${reason}`, true)

    clearInterval(this.hbInterval)
    clearInterval(this.connectTimeout)
    if (!this.shard.dying) this.reconnect()
  }

  /**
   * Handles hello event
   * @param {Object} msg Message object
   */
  hello (msg) {
    if (this.reconnecting) {
      this.sendRaw({
        op: 6,
        d: {
          token: this.client.token,
          session_id: this.sessionID,
          seq: this.s
        }
      })
    } else {
      this.sendRaw({
        op: 2,
        d: {
          shard: [this.shard.id, this.client.options.shardCount],
          token: this.client.token,
          intents: 1 << 0 | // guilds
                   1 << 1 | // guild member
                   // 1 << 8 | // presence
                   1 << 9 | // messages
                   1 << 10, // reactions
          properties: {
            $os: 'linux',
            $browser: 'censor bot',
            $device: 'bot'
          }
        }
      })
    }
    if (!msg) return
    this.hbInterval = setInterval(this.heartbeat.bind(this), msg.d.heartbeat_interval)
    this.waitingHeartbeat = false
    this.heartbeat()
  }

  /**
   * Sends a heartbeat
   */
  heartbeat () {
    if (this.waitingHeartbeat) {
      this.retention++
      this.client.log(`Shard ${this.shard.id} heartbeat took too long. Retention at ${this.retention}`, true)
      if (this.retention > 5) return this.kill()
    };
    this.sendRaw({
      op: 1,
      d: this.s
    })
    this.waitingHeartbeat = new Date().getTime()
  }

  /**
   * Handles heartbeat acknowledge
   */
  ack () {
    const cur = new Date().getTime() - this.waitingHeartbeat
    this.shard.ping = cur
    this.waitingHeartbeat = false

    if (this.retention > 1) this.client.log(`Shard ${this.shard.id} receovered from late heartbeats`)

    this.retention = 0
  }

  /**
   * Sends packet to websocket
   * @param {Object} data Data
   */
  sendRaw (data) {
    this.ws.send(
      JSON.stringify(
        data
      )
    )
  }

  /**
   * Sends event to websocket
   * @param {String} event Event name
   * @param {Object} data Event data
   */
  send (event, data) {
    this.sendRaw({
      t: event,
      d: data
    })
  }

  /**
   * Kills websocket
   */
  kill () {
    if (!this.ws) return
    try {
      this.ws.close()
    } catch (err) {
      // WS closed mid connection
    }
  }

  /**
   * Reconnects websocket
   */
  reconnect () {
    this.reconnecting = true

    this.client.log(`Shard ${this.shard.id} attempting to resume`)

    this.setup()
  }
}

module.exports = DiscordWebsocket
