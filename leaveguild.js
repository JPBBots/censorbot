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
