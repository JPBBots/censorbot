const Discord = require('discord.js');

const bot = new Discord.Client();

const auth = require('./auth.json')

const logchannel = bot.channels.get("399688995283533824")

const serverlistchannel = bot.channels.get("413831069117186078")

const swears = require("./swears.json")

var mysql = require('mysql')

var curses = new RegExp (swears.var, 'gi')

const modulename = "nicknamefilter"

var connection = mysql.createConnection({



	host: "localhost",



	user: "bot",



	password: "passwordlmao",



	database: "bot"



}); 

bot.on('message', async (message) => {
	if(message.content == "+restart all") {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		message.delete();
			connection.query("CRASH")
	}
		if(message.content == "+restart nicknamefilter") {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		message.delete();
			connection.query("CRASH")
	}
		if(message.content == "+modulesonline") {
		message.channel.send(`${modulename} = Online (10 In Total)`)
	}
});

bot.on("ready", () => {
console.log("sector on")
const statuslog = bot.channels.get("450444337357258772")
statuslog.send(`${Date().toLocaleString()} Module Started: ${modulename}`)
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

