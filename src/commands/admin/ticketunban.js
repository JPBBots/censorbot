exports.run = async (client, message, args) => {
  message.delete()
  const fs = require('fs')
  const arg1 = args[0]
  try {
    client.users.get(arg1).send(`Hey! You have been unbanned from the ticket feature by ${message.author.username}`)
  } catch (err) {
    client.sendErr(message, "User could not be DM'd (still unbanned)")
  }
  client.msg('ticketBanned', `${message.author} unbanned user (${client.users.get(arg1)})${client.users.get(arg1).username} from the ticket command.`)
  client.ticketerdb.update(arg1, { banned: false, reason: undefined, when: undefined })
}
exports.info = {
  name: 'ticketunban',
  description: "Unban's user from the ticket feature",
  format: '{prefix}ticketunban',
  aliases: ['tub']
}
