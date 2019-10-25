exports.run = (client, message, args) => {
  const arg1 = args[0]
  const arg2 = args[1]
  const user = client.users.get(arg1)
  user.send('Hello, owner/helper has requested that you join the support server either for confirmation or for a quick update such as a ticket confirm, please join: ' + client.config.support + ' Thanks!')
}
exports.info = {
  name: 'sendinv',
  description: 'Send invite to user',
  format: '{prefix}sendinv [userid]'
}
