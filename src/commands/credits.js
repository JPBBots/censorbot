exports.run = async (client, message, args) => {
  let response = await client.shard.broadcastEval(`
        function getStuff(client) {
            let guild = client.guilds.get("399688888739692552")
            if(!guild) return;
            return guild.roles.get("623847631566798868").members.map(x=>x.user.tag).join(", ");
        }
        getStuff(this);
    `)

  response = response.filter(x => x)
  message.channel.send(client.u.embed
    .setTitle('Credits')
    .setURL(client.config.website)
    .setThumbnail(client.user.avatarURL())
    .addField('Head Developer', client.users.get(client.config.ownerID).tag + ' : [Twitter](https://twitter.com/jpbberry) - [Instagram](https://instagram.com/jpbberry) ')
    .addField('Helpers', response)
    .addField('Icon Art', 'higbead#0871')
    .addField('Translators', 'English: Literally everyone\nSpanish: JPBBerry#0001\nPolish: Marcel#0473')
  )
}
exports.info = {
  name: 'credits',
  description: "Displays {name}'s Developers and contributers",
  format: '{prefix}credits',
  aliases: ['creds']
}
