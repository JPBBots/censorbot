const Discord = require('discord.js');
const bot = new Discord.Client();
const auth = require('./auth.json')
const logchannel = bot.channels.get("399688995283533824")
const serverlistchannel = bot.channels.get("413831069117186078")
var mysql = require('mysql')
const DBL = require("dblapi.js")
const dbl = new DBL(auth.dbltoken)
const stuff = require('./stuff.json')
const modulename = "botready"

bot.on('ready', () => {
    setInterval(() => {

        dbl.postStats(bot.guilds.size);
		bot.user.setGame('In ' + bot.guilds.size + ' servers! | +help');
		console.log(`Updated ${bot.guilds.size}`)
    }, 1800000);});

var connection = mysql.createConnection({

	host: auth.mysqlhost,

	user: auth.mysqluser,

	password: auth.mysqlpassword,

	database: auth.mysqldatabase

}); 

bot.on('message', async (message) => {
	if(message.content == "+restart all") {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		message.delete();
			connection.query("CRASH")
	}
		if(message.content == "+restart " + modulename) {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		message.delete();
			connection.query("CRASH")
	}
		if(message.content == "+modulesonline") {
		message.channel.send(`${modulename} = Online (${stuff.moduleamount} In Total)`)
	}
	const yes = bot.emojis.get("427889207608999938");
if(message.content == "+module " + modulename) {
	message.reply(`${modulename} status: ${yes}`)
}
});

bot.on("ready", () => {
	const logchannel = bot.channels.get("399688995283533824")
console.log('Bot Started...' + bot.guilds.size);
bot.user.setStatus("online");
bot.user.setGame('In ' + bot.guilds.size + ' servers! | +help');
logchannel.send("Bot Either Crashed Or Was Restarted... BOT ONLINE")
const statuslog = bot.channels.get("450444337357258772")
statuslog.send(`${Date().toLocaleString()} Module Started: ${modulename}`)
});


bot.login(auth.token);