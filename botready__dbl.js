const Discord = require('discord.js');
const bot = new Discord.Client();
const auth = require('./auth.json')
const logchannel = bot.channels.get("399688995283533824")
const serverlistchannel = bot.channels.get("413831069117186078")
const swears = require("./swears.js")
var mysql = require('mysql')
const DBL = require("dblapi.js")
const dbl = new DBL(auth.dbltoken)
bot.on('ready', () => {
    setInterval(() => {

        dbl.postStats(bot.guilds.size);
		bot.user.setGame('In ' + bot.guilds.size + ' servers!');
		console.log(`Updated ${bot.guilds.size}`)
    }, 1800000);});

var connection = mysql.createConnection({

	host: "localhost",

	user: "bot",

	password: "passwordlmao",

	database: "bot"

}); 


bot.on("ready", () => {
	const logchannel = bot.channels.get("399688995283533824")
console.log('Bot Started...' + bot.guilds.size);
bot.user.setStatus("online");
bot.user.setGame('In ' + bot.guilds.size + ' servers!');
logchannel.send("Bot Either Crashed Or Was Restarted... BOT ONLINE")
});


bot.login(auth.token);