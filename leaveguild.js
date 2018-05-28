const Discord = require('discord.js');

const bot = new Discord.Client();

const auth = require('./auth.json')

const logchannel = bot.channels.get("399688995283533824")

const serverlistchannel = bot.channels.get("413831069117186078")

const swears = require("./swears.js")

var mysql = require('mysql')

const modulename = "leaveguild"

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
		if(message.content == "+restart leaveguild") {
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








bot.on("guildDelete", (guild) => {
	console.log(`Left ${guild.name}`)
	 const botowner = bot.users.get("142408079177285632")
	 botowner.send(`left ${guild.name}`)
	 bot.user.setGame('In ' + bot.guilds.size + ' servers!');
	 connection.query("DELETE FROM censorbot WHERE serverid = " + guild.id)
})

//



bot.login(auth.token);
