module.exports = function(bot, connection, stuff, auth) {

  const modulename = "kickbanping"
  var statuslog = bot.channels.get("450444337357258772")
  var logchannel = bot.channels.get("399688995283533824")
  var serverlistchannel = bot.channels.get("413831069117186078")
  var botowner = bot.users.get("142408079177285632")



  bot.on('message', async(message) => {

      const args = message.content.slice().trim().split(/ +/g);
      const command = args.shift().toLowerCase();


      if (command === "+ping") {
          const m = await message.channel.send("Ping?");
          m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
      }


      if (command === "+kick") {
          if (!message.member.hasPermission('KICK'))
              return message.reply("Sorry, you don't have permissions to use this!");

          let member = message.mentions.members.first() || message.guild.members.get(args[0]);
          if (!member)
              return message.reply("Please mention a valid member of this server");
          if (!member.kickable)
              return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

          let reason = args.slice(1).join(' ');
          if (!reason) reason = "No reason provided";

          await member.kick(reason)
              .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
          message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
          const logchannelxd = message.guild.channels.find("name", "log");



          console.log("xd")

          if (!logchannelxd) {

              message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the kick!")

          }

          if (logchannelxd) {

              logchannelxd.send(`User ${member} kicked by ${message.author.tag} for ${reason}`)

          }

      }

      if (command === "+ban") {
          if (!message.member.hasPermission('BAN'))
              return message.reply("Sorry, you don't have permissions to use this!");

          let member = message.mentions.members.first();
          if (!member)
              return message.reply("Please mention a valid member of this server");
          if (!member.bannable)
              return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

          let reason = args.slice(1).join(' ');
          if (!reason) reason = "No reason provided";

          await member.ban(reason + ' - Banned By' + message.author.tag)
              .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
          message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
          const logchannelxd = message.guild.channels.find("name", "log");



          console.log("xd")

          if (!logchannelxd) {

              message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the ban!")

          }

          if (logchannelxd) {

              logchannelxd.send(`User ${member} banned by ${message.author.tag} for ${reason}`)

          }
      }

      if (command === "+purge") {
          const deleteCount = parseInt(args[0], 10);

          if (!deleteCount || deleteCount < 2 || deleteCount > 100)
              return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

          const fetched = await message.channel.fetchMessages({
              count: deleteCount
          });
          message.channel.bulkDelete(fetched)
              .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
      }

  });
}