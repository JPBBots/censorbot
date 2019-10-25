module.exports = (client, oldMember, newMember) => {
  if (oldMember.user.bot) return
  if (oldMember.guild.id == '264445053596991498') return
  if (oldMember.guild.id == '110373943822540800') return
  if (oldMember.guild.id == '417131675701477386') return
  client.filterHandler.nick(client, oldMember, newMember)
}
