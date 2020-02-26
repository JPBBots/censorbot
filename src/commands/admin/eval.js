function clean (text) {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

const Discord = require('discord.js')

const evals = new Discord.Collection()

exports.run = async (client, message, args) => {
  client.evals = evals
  if (message.author.id !== client.config.ownerID) return message.reply('only the owner can run this command')
  const s = (msg, opts) => message.channel.send(msg, opts)
  try {
    const code = args.join(' ').replace(/(‘|’)/g, "'").replace(/(“|”)/g, '"')
    let evaled = eval(code)

    if (evaled && evaled.then) evaled = await evaled

    if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled) }

    const msg = evals.get(message.id)
    if (msg) {
      clearTimeout(msg.to)
      evals.delete(message.id)
      if (evaled.length > 2000) {
        msg.x.edit('Response to big').then(x => {
          evals.set(message.id, {
            x: x,
            to: setTimeout(() => {
              client.evals.delete(message.id)
            }, 120000)
          })
        })
      } else {
        msg.x.edit(clean(evaled), {
          code: 'xl'
        }).then(x => {
          evals.set(message.id, {
            x: x,
            to: setTimeout(() => {
              evals.delete(message.id)
            }, 120000)
          })
        })
      }
    } else {
      if (evaled.length > 2000) {
        message.reply('Response too big!').then(x => {
          evals.set(message.id, {
            x: x,
            to: setTimeout(() => {
              client.evals.delete(message.id)
            }, 120000)
          })
        })
      } else {
        message.channel.send(clean(evaled), {
          code: 'xl'
        }).then(x => {
          evals.set(message.id, {
            x: x,
            to: setTimeout(() => {
              evals.delete(message.id)
            }, 120000)
          })
        })
      }
    }
  } catch (err) {
    const msg = evals.get(message.id)
    if (msg) {
      clearTimeout(msg.to)
      evals.delete(message.id)
      msg.x.edit(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
        .then(x => {
          evals.set(message.id, {
            x: x,
            to: setTimeout(() => {
              evals.delete(message.id)
            }, 120000)
          })
        })
    } else {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
        .then(x => {
          evals.set(message.id, {
            x: x,
            to: setTimeout(() => {
              client.evals.delete(message.id)
            }, 120000)
          })
        })
    }
  }
}
exports.info = {
  name: 'eval',
  description: 'evaluates script on backend',
  format: '{prefix}eval [script]'
}
