exports.run = (client, message, args) => {
  message.delete()
  message.channel.send(client.u.embed
    .setTitle('Frequently Asked Questions (FAQ)')
    .setURL(client.config.website)
    .setColor(4070736)
    .setAuthor(client.config.name, client.user.avatarURL(), client.config.invitesite)
    .addField('What is the help command', client.config.prefix + 'help')
    .addField('How to allow cursing in certain channels', 'Set the channel to `NSFW`')
    .addField('How to turn on/off the filter', 'Use `' + client.config.prefix + 'on` and `' + client.config.prefix + 'off`')
    .addField("I'm getting an error message about the log channel", 'Run +setlog in a desired log channel')
    .addField("I found a word that shouldn't be censored", "Run `+ticket word <word that shouldn't be censored>` and a staff member will get on it as soon as possible")
    .addField('I am banned from using the ticket command', 'This was most likely from overuse of the command, if you believe this was a mistake join the [support server](' + client.config.support + ')')
    .addField('Can I add/remove my own words', 'If you know an ACTUAL bad word to be censored DM the owner! However if you have a very server specific bad word, use the +filter command!')
  )
}
exports.info = {
  name: 'faq',
  description: "Display's frequently asked questions (Please use before asking for help)",
  format: '{prefix}faq'
}
