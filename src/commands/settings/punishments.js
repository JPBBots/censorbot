exports.run = async (client, message, args, db) => {
  message.delete()
  if (!args[0]) {
    return message.channel.send(client.u.embed
      .setTitle('Punishment user settings.')
      .setDescription(`Change punishment data for specific users.\n\nHow to: \`${client.config.prefix}punishments @User [setting] ...\`\n\nSettings:`)
      .addField('nothing', 'See data for said user.\nExample: `punishments @User`, will display the data for said user')
      .addField('set', 'Sets a users punishment amount. Takes amount to set to. \nExample: `punishments @User set 3`, will set the users punishments to 3.')
      .addField('reset', 'Resets users punishment amount.\nExample: `punishments @User reset`, will reset the users punishments')
    )
  }
  
  const user = await message.guild.members.fetch((args[0].match(/<@!?([0-9]+)>/) || {})[1] || args[0])
  
  if (!user) return client.sendErr(message, 'Invalid user.')
  
  const punishUser = await client.punishdb.find({
    g: message.guild.id,
    u: user.id
  })
  
  if (!args[1]) {
    if (!punishUser) return client.sendErr(message, 'User does not have any current punishments.')
    
    return message.channel.send(client.u.embed
      .setTitle(`Punishments for ${user.user.tag}`)
      .setColor('GREEN')
      .setDescription(`Current punishments amount: ${punishUser.a}`)
    )
  }
  
  switch(args[1]) {
    case 'set':
      const amount = parseInt(args[2])
      if (!amount) return client.sendErr(message, 'Missing or invalid new amount. Command: `punishments @User set [amount]`')
      if (amount > 120) return client.sendErr(message, '.')
      await client.punishdb.db.updateOne(
        {
          g: message.guild.id,
          u: user.id
        },
        {
          $set: {
            g: message.guild.id,
            u: user.id,
            a: amount
          }
        },
        {
          upsert: true
        }
      )
      client.sendSuccess(message, `Set ${user.user.tag} punishment amount to ${amount}`, `${message.author.tag} changed punishment.`)
      break
    case 'reset':
      if (!punishUser) return client.sendErr(message, 'User does not have any punishments')
      await client.punishdb.db.deleteOne({
        g: message.guild.id,
        u: user.id
      })
      client.sendSuccess(message, `Removed ${user.user.tag}'s punishments`, `${message.author.tag} changed punishments.`)
      break
    default: 
      client.sendErr(`Invalid setting option \`${args[1]}\``)
      break
  }
}
exports.info = {
  name: 'punishments',
  description: 'Change punishments for user',
  format: '{prefix}punishments @user [setting] [value]',
  aliases: ['pu', 'punish']
}
