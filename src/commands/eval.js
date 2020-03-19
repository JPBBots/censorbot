function clean (text) {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

exports.run = async function (message, args) {
  if (message.author.id !== this.config.owner) return this.send('no')
  const client = this.client // eslint-disable-line no-unused-vars
  try {
    const code = args.join(' ').replace(/(‘|’)/g, "'").replace(/(“|”)/g, '"')
    let evaled = eval(code) // eslint-disable-line no-eval

    if (evaled && evaled.then) evaled = await evaled

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
