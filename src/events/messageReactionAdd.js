module.exports = (client, reaction, user) => {
  if (!reaction.message.guild) return
  if (reaction.message.guild.id == '110373943822540800') return
  if (reaction.message.guild.id == '417131675701477386') return

  client.filterHandler.react(client, reaction, user)
}
