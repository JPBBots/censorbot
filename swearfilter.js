const Discord = require('discord.js');

const bot = new Discord.Client();

const auth = require('./auth.json')

const logchannel = bot.channels.get("399688995283533824")

const serverlistchannel = bot.channels.get("413831069117186078")

const swears = require("./swears.json")

var mysql = require('mysql')

var curses = new RegExp (swears.var)

var connection = mysql.createConnection({



	host: "localhost",



	user: "bot",



	password: "passwordlmao",



	database: "bot"



}); 

bot.on("ready", () => {
console.log("sector on")
})

//


bot.on('message', async (message) => {

if(!message.guild) return;	


if (!message.guild) return;
if(message.channel.nsfw) return;
if(message.author.bot) return;
    if (message.author.id !='270198738570444801' && message.author.id !='394019914157129728' && message.author.id !='204255221017214977') {
  if (message.guild.id !='110373943822540800' && message.guild.id !='414039704514592770' && message.guild.id !='149220234690166785' &&  message.guild.id !='343024903735214081' &&  message.guild.id !='380174860523143169' && message.guild.id !='264445053596991498') {
if(message.channel.id == "413185119080153088") return;    
if(message.channel.id == "413825688076943362") return;
//connection.query('SELECT * FROM censorbot WHERE serverid = ' + message.guild.id, function (err, rows) {
//    let go = rows[0].censor
//	console.log(go)
//	if(go == "0") return;
//	})

if (message.content.match(curses)) {

 message.delete()
   const popnomsg = await message.reply("You're not allowed to say that...")
    setTimeout(function() {
popnomsg.delete()
}, 3000);
	
    console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id} | Channel: ${message.channel.name} ${message.channel.id}`)   
    		const logchannelxd = message.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Channel: ${message.channel.name} ${message.channel.id}`)

	}

	}
  }
  if (message.content == 'dic') {
           message.delete()
   nomsg = await message.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
   const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
      		const logchannelxd = message.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Channel: ${message.channel.name} ${message.channel.id}`)

	}}
       
        if (message.content.match(/(vagin|v.a.g.i.n| ass)/gi)) {
     message.delete()
   nomsg = await message.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
            const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
      		const logchannelxd = message.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Channel: ${message.channel.name} ${message.channel.id}`)

	}} 
  if (message.content == 'ass') {
            message.delete()
   nomsg = await message.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
  const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
      		const logchannelxd = message.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Channel: ${message.channel.name} ${message.channel.id}`)

	}}
  if (message.content == 'penis') {
            message.delete()
   nomsg = await message.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
  const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
      		const logchannelxd = message.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Channel: ${message.channel.name} ${message.channel.id}`)

	}}
           if (message.guild.id !='149220234690166785' &&  message.guild.id !='343024903735214081' &&  message.guild.id !='380174860523143169' && message.guild.id !='398122224638492676') {
if (message.content == 'sex') {
      message.delete()
   nomsg = await message.reply("You're not allowed to say that...")
    setTimeout(function() {
nomsg.delete()
}, 3000);
    console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
    		const logchannelxd = message.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			message.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")

		}

	if(logchannelxd) {

		logchannelxd.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Channel: ${message.channel.name} ${message.channel.id}`)

	}} 
    }
  }
      
    
}); 


//



bot.login(auth.token);





