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
bot.on('guildMemberUpdate', (newMember, oldMember, guild) => {
   
if (oldMember.displayName.match(curses)) {
    
oldMember.setNickname(' ')
    console.log(`Changed username of ${oldMember.id} because it was innapropriate ${oldMember.displayName}`)   
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Changed username of ${oldMember.id} because it was innapropriate`) 

	
	      		const logchannelxd = oldMember.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			return;

		}

	if(logchannelxd) {

		logchannelxd.send(`Changed ${oldMember}'s nickname because it was innapropriate (Was "${oldMember.displayName}")`)

	}
	
	
}
})
bot.login(auth.token);

