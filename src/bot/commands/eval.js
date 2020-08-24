function clean (text) {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

let temp // eslint-disable-line no-unused-vars

exports.run = async function (message, args, prefix) {
  const method = ({
    '-b': 'eval',
    '-c': 'masterEval'
  })[args[0]]

  if (message.author.id !== this.config.owner) return this.send('no')
  const client = this.client // eslint-disable-line no-unused-vars
  try {
    const code = message.content.slice(prefix.length + 5 + (method ? 3 : 0)).replace(/(‘|’)/g, "'").replace(/(“|”)/g, '"')
    let evaled = method ? this.client.cluster.internal[method](code) : eval(code) // eslint-disable-line no-eval
    if (evaled && evaled.then) evaled = await evaled

    if (evaled instanceof Array && evaled[0] instanceof String) {
      if (evaled.some(x => x.startsWith('Error: '))) throw new Error(`${evaled[0].slice('Error: '.length)}`)
    } else if (evaled instanceof String) {
      if (evaled.startsWith('Error: ')) throw new Error(`${evaled.slice('Error: '.length)}`)
    }

    if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled) }

    this.send(`\`\`\`xl\n${clean(evaled)}\`\`\``)
  } catch (err) {
    this.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
  }
}

exports.info = {
  name: 'eval',
  description: 'Eval',
  format: '{prefix}eval',
  admin: true
}
