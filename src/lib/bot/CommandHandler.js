const { readdirSync } = require('fs')
const dir = require('path').resolve.bind(undefined, __dirname)
const Collection = require('../../../util/Collection')

const Command = require('./Command')

class CommandHandler {
  constructor (client) {
    this.client = client
    this.client.log(0, 0, 'CommandHandler')
    this.commands = new Collection()

    this.client.log(0, 1, 'CommandHandler')

    this.load()
  }

  load () {
    this.client.log(2, 0, '/commands')
    this.commands.clear()
    const commands = readdirSync(dir('../../commands'))
    commands.forEach(cmd => {
      const [name, ext] = cmd.split('.')
      if (ext !== 'js') return

      delete require.cache[require.resolve(dir('../../commands', `${name}.${ext}`))]

      const command = require(dir('../../commands', `${name}.${ext}`))
      this.commands.set(name, command)
    })

    this.client.log(2, 1, `${commands.length} commands`)
  }

  event (msg) {
    const channel = this.client.channels.get(msg.channel_id)
    if (!channel || msg.type !== 0 || channel.type !== 0 || msg.author.bot) return

    const prefix = this.client.config.prefix.find(x => msg.content.startsWith(x))
    if (!prefix) return

    const args = msg.content.slice(prefix.length).split(/\s/)
    const command = args.shift()

    this.client.log(2, 4, `${command}`, `${msg.author.username}#${msg.author.discriminator}; ${msg.author.id}`)

    this.run(command, msg, args, prefix)
  }

  async run (command, msg, args, prefix) {
    const cmd = this.commands.find(x => [x.info.name, ...(x.info.aliases || [])].includes(command.toLowerCase()))
    if (!cmd) return

    if (cmd.info.admin && !await this.client.isAdmin(msg.author.id)) return this.client.interface.send(msg.channel_id, 'You do not have permission to run this command.')

    cmd.run.bind(new Command(this.client, msg))(msg, args, prefix)
  }

  list () {
    const cmds = this.commands
      .filter(x => !x.info.admin)
      .map(x => x.info.name)
      .sort()
      .map(x => this.commands.get(x).info)

    return cmds
  }
}

module.exports = CommandHandler
