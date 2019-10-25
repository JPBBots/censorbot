exports.run = (client, message, args) => {
  const arg1 = args[0]
  const arg2 = args[1]
  const user = client.users.get(arg1)
  const msg = args.slice(1).join(' ')
  user.send(msg)
}
exports.info = {
  name: 'sendmsg',
  description: 'Used to send message to user',
  format: '{prefix}sendmsg [userid] [message]'
}
