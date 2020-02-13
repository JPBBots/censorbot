module.exports.run = async (client, message, args, db) => {
  const data = await db.getAll()
  const user = message.mentions.members.first() || message.member
  const member = await message.guild.members.fetch(client.user.id)
  const admin = member.hasPermission("ADMINISTRATOR")
  const position = member.roles.highest.rawPosition
  
  const embed = client.u.embed
    .setTitle('Debug')
    .addField('Shard', client.shard.id, true)
    .addField('Admin Permissions', admin, true)
    .addField('Role Position', `${message.guild.roles.size - position}/${message.guild.roles.size}`, true)
    .addField('User', `${user} ${user.user.bot}`, true)
    .addField('User Bannable', user.bannable, true)
    .addField('User Kickable', user.kickable, true)
    .addField('User Manageable', message.guild.ownerID === user.id ? 'false' : user.roles.highest.rawPosition < position, true)
    .addField('User Uncensored', user.roles.has(data.role), true)
    .addField('Base', data.base, true)
    .addField('Punishments', `${data.punishment.type} | ${data.punishment.amount} | <@&${data.punishment.role}>`, true)
    .addField('Can set mute role', data.punishment.type === 1 && data.punishment.role ? (message.guild.roles.get(data.punishment.role).rawPosition < position) : 'false', true)
    .setFooter('This info is built for Censor Bot support staff to better help you, none of it is private information')
    
  message.channel.send(embed)
}

module.exports.info = {
  name: "debug",
  desc: "Debugs the bots",
  usage: "{prefix}debug"
}