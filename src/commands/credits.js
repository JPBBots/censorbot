exports.run = (client,message,args) => {
      message.channel.send(client.u.embed
        .setTitle("Credits")
        .setURL(client.config.website)
        .setThumbnail(client.user.avatarURL())
        .addField("Head Developer", client.users.get(client.config.ownerID).tag + " : [Twitter](https://twitter.com/jpbberry) - [Instagram](https://instagram.com/jpbberry) ")
        .addField("Debug Developer", "BillyTheBus#1552 : [Twitter](https://twitter.com/Mattwels04)")
        .addField("Icon Art", "higbead#0871")
        .addField("Translators", "English: Literally everyone\nSpanish: JPBBerry#0001\nPolish: Marcel#0473")
      );
}
exports.info = {
    name: 'credits',
    description: "Displays {name}'s Developers and contributers",
    format: "{prefix}",
    aliases: ["creds"]
}