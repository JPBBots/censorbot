const modulename = "leaveguild"


const Discord = require('discord.js');
const bot = new Discord.Client();
const auth = require('./auth.json')
const swears = require("./swears.json")
var mysql = require('mysql')
var curses = new RegExp (swears.var, 'gi')
const stuff = require('./stuff.json')
var statuslog = bot.channels.get("450444337357258772")
var logchannel = bot.channels.get("399688995283533824")
var serverlistchannel = bot.channels.get("413831069117186078")
var botowner = bot.users.get("142408079177285632")
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
connection.query("CRASH")
}
if(message.content == "+restart " + modulename) {
const botowner = bot.users.get("142408079177285632")
if(message.author != botowner) return;
connection.query("CRASH")
}
if(message.content == "+modulesonline") { message.channel.send(`${modulename} = Online (${stuff.moduleamount} In Total)`) }
const yes = bot.emojis.get("427889207608999938");
if(message.content == "+module " + modulename) {
	message.reply(`${modulename} status: ${yes}`)
}
});
bot.on('ready', () => {
    console.log('sector on');
	const statuslog = bot.channels.get("450444337357258772")
statuslog.send(`${Date().toLocaleString()} Module Started: ${modulename}`)
});

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
