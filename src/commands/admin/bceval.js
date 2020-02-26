function clean (text) {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

const Discord = require('discord.js')

exports.run = async (client, message, args) => {
  if (message.author.id !== client.config.ownerID) return message.reply('only the owner can run this command')
  try {
    const code = args.join(' ')
    client.shard.broadcastEval(`const client = this; \n ${code}`).then(evaled => {
      const emb = new client.discord.MessageEmbed()
        .setTitle('Response from broadcastEval')
        .setFooter('In context of `client`')
      for (i = 0; i < evaled.length; i++) {
        if (typeof evaled[i] !== 'string') { evaled[i] = require('util').inspect(evaled[i]) }
        emb.addField(`Shard ${i}`, `\`\`\`xl\n${clean(evaled[i])}\`\`\``, false)
      }
      message.channel.send(emb)
    })
  } catch (err) {
    message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
  }
}
exports.info = {
  name: 'bceval',
  description: 'evaluates script on backend between shards',
  format: '{prefix}bceval [script]'
}
