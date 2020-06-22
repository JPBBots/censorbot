const { readdirSync } = require('fs')
const dir = require('path').resolve.bind(undefined, __dirname)
const Collection = require('../../../util/Collection')

delete require.cache[require.resolve('./Command')]
const Command = require('./Command')

const moment = require('moment')
require('moment-duration-format')

/**
 * Used for taking in message events and running commands
 */
class CommandHandler {
  /**
   * Command Handler
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client

    /**
     * Commands
     * @type {Collection.<String, Command>}
     */
    this.commands = new Collection()

    /**
     * Cooldown list
     * @type {Collection.<String, Number>}
     */
    this.cooldowns = new Collection()

    this.load()
  }

  /**
   * (Re)Loads commands
   */
  load () {
    this.commands.clear()
    const commands = readdirSync(dir('../../commands'))
    commands.forEach(cmd => {
      const [name, ext] = cmd.split('.')
      if (ext !== 'js') return

      delete require.cache[require.resolve(dir('../../commands', `${name}.${ext}`))]

      const command = require(dir('../../commands', `${name}.${ext}`))
      this.commands.set(name, command)
    })
  }

  /**
   * Handles message event
   * @param {Object} msg Message
   */
  event (msg, pre) {
    const channel = this.client.channels.get(msg.channel_id)
    if (!channel || msg.type !== 0 || channel.type !== 0 || msg.author.bot) return

    const prefix = [...this.client.config.prefix, ...(pre ? [pre] : [])].find(x => msg.content.startsWith(x))
    if (!prefix) return

    const args = msg.content.slice(prefix.length).split(/\s/)
    const command = args.shift()

    try {
      this.run(command, msg, args, prefix)
    } catch (err) {
      console.error(err)
    }

    return command
  }

  /**
   * Run command
   * @param {String} command Command name
   * @param {Object} msg Message
   * @param {Array.<String>} args Command arguments
   * @param {String} prefix Prefix used to run
   */
  async run (command, msg, args, prefix) {
    const cmd = this.commands.find(x => [x.info.name, ...(x.info.aliases || [])].includes(command.toLowerCase()))
    if (!cmd) return

    if (cmd.info.admin && !await this.client.isAdmin(msg.author.id)) return this.client.interface.send(msg.channel_id, 'You do not have permission to run this command.')

    const cooldown = this.cooldowns.get(`${msg.author.id}${cmd.info.name}`)
    if (cooldown) return this.client.interface.send(msg.channel_id, `Please wait **${moment.duration(cooldown - Date.now()).format('m[m] s[s]')}** before running this command again.`)

    cmd.run.bind(new Command(this, msg, cmd))(msg, args, prefix)

    this.client.log(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) ran ${command}`)
  }

  /**
   * List commands
   * @param {Boolean} admin Whether to show admin commands
   * @returns {Array.<Object>} Command info's
   */
  list (admin) {
    const cmds = this.commands
      .filter(x => admin ? true : !x.info.admin)
      .map(x => x.info.name)
      .sort()
      .map(x => this.commands.get(x).info)

    return cmds
  }
}

module.exports = CommandHandler
