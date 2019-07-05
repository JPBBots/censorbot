exports.run = async (client,message,args) => {
    message.delete()
    function formatDate(date) {
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];
      
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
      
        return monthNames[monthIndex] + ' ' + day + ' ' + year;
      }
    var bannedUser = await client.ticketerdb.get(args[0]).run();
    if(bannedUser && bannedUser.banned) {
        var embed = new client.discord.MessageEmbed()
            .setTitle("Banned User")
            .setColor("RED")
            .setThumbnail(client.users.get(args[0]).displayAvatarURL())
            .setDescription(`ID: ${args[0]} | Username: ${client.users.get(args[0]).username}`)
            .addField("Reason", bannedUser.reason, true)
            .addField("Denied Amount", bannedUser.no, true)
            .addField("Banned On", formatDate(bannedUser.when), true)
            .addField("At", `${bannedUser.when.getHours()}:${bannedUser.when.getMinutes()}`, true)
            .setFooter("Requested by " + message.author.tag);
        message.channel.send(embed);
    } else {
        message.reply('false').then(res=>{res.delete(2000)})
    }
}
exports.info = {
    name: 'isbanned',
    description: "Returns if user is banned",
    format: "{prefix}isbanned [userid]",
}