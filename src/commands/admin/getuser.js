exports.run = async (client, message, args) => {
  var user
  if (args.join(' ').match('#')) {
    user = client.u.resolveTag(args.join(' '))
  } else if (!isNaN(args[0])) {
    user = client.users.get(args[0])
  } else if (message.mentions.users.first()) {
    user = message.mentions.users.first()
  }
  if (!user) return message.channel.send('Invalid user')

  message.channel.send(await client.u.ShardUserEmbed(user))
}

exports.info = {
  name: 'getuser',
  description: 'Gets info on user',
  format: '{prefix}getuser [userresolveable]',
  aliases: ['user', 'userinfo']
}
