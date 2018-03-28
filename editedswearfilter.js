const Discord = require('discord.js');

const bot = new Discord.Client();

const auth = require('./auth.json')

const logchannel = bot.channels.get("399688995283533824")

const serverlistchannel = bot.channels.get("413831069117186078")

const swears = require("./swears.js")

var mysql = require('mysql')

var connection = mysql.createConnection({



	host: "localhost",



	user: "bot",



	password: "passwordlmao",



	database: "bot"



}); 

bot.on("ready", () => {
console.log("sector on")
})

bot.on('messageUpdate', async (newMessage, oldMessage, guild) => {
if(!oldMessage.guild) return;
if(oldMessage.channel.nsfw) return;

       if(oldMessage.guild.id == "149220234690166785") return;
	   if(oldMessage.guild.id == "110373943822540800") return;
	   if(newMessage.guild.id == "264445053596991498 ") return;
	   if(oldMessage.guild.id == "110373943822540800") return;
	   if(newMessage.guild.id == "264445053596991498") return;
	   if(oldMessage.guild.id == "414039704514592770") return;
    if (oldMessage.content.match(/(b i t c|bit c|b itc|b it c|kys|k y s|k ys|ky s|dick| dic |d l c|dlc|d i c| dic|cunt|c u n t|bitch|bish|shit|fuc|p0rn|nig|d1c|d 1 c|n l g|n i g|n 1 g|n1g|nlg|n!g|bast|wank|f ag|fa g|fag|f4g|f 4 g|f a g|f @ g|f@g|sex |tits|8--|8==|dild|porn|fuk|slut|whore|retard|f u c k|cock|nibba|f u k|f.u.c)/gi)) {

 

    oldMessage.delete()
   nomsg = await oldMessage.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);

 

    console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

    const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)  

      		const logchannelxd = oldMessage.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			oldMessage.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)

	}

}

 

  if (oldMessage.content == 'dic') {

 

            oldMessage.delete()
   nomsg = await oldMessage.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

   const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

     		const logchannelxd = oldMessage.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			oldMessage.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)

	}

  }

 

       

 

      if (oldMessage.guild.id !='276450119598080000' && oldMessage.guild.id !='399453498674249739') {

 if(oldMessage.guild.id == "264445053596991498 ") return;

        if (oldMessage.content.match(/(vagin|v.a.g.i.n| ass)/gi)) {

 

       oldMessage.delete()
   nomsg = await oldMessage.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

            const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

 

  }

 

  if (oldMessage.content == 'ass') {

 

             oldMessage.delete()
   nomsg = await oldMessage.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

  const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Channel: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

      		const logchannelxd = oldMessage.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			oldMessage.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)

	}

  }

 

  if (oldMessage.content == 'penis') {

 

             oldMessage.delete()
   nomsg = await oldMessage.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

  const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

      		const logchannelxd = oldMessage.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			oldMessage.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)

	}

  }

 

           if (oldMessage.guild.id !='149220234690166785' &&  oldMessage.guild.id !='343024903735214081' &&  oldMessage.guild.id !='380174860523143169' && oldMessage.guild.id !='398122224638492676') {

 

if (oldMessage.content == 'sex') {

 

       oldMessage.delete()
   nomsg = await oldMessage.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);

 

    console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

    const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

      		const logchannelxd = oldMessage.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			oldMessage.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)

	}

}

 

    }

 

     

 

     

 

    }

 

});
bot.login(auth.token);