exports.run = async (client, message, args) => {
  message.delete()
  const votemsg = await message.reply(`You can vote for ${client.config.name} by going to https://discordbots.org/bot/394019914157129728/vote It really does help if you do!!`)
  setTimeout(function () {
    votemsg.edit(':boom:')
    setTimeout(function () {
      votemsg.delete()
    }, 1000)
  }, 10000)
}
exports.info = {
  name: 'vote',
  description: 'Gives link to vote for {name} On discordbots.org, It really helps!!',
  format: '{prefix}vote',
  aliases: ['v']
}
