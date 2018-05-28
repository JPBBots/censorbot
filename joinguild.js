const Discord = require('discord.js');

const bot = new Discord.Client();

const auth = require('./auth.json')

const logchannel = bot.channels.get("399688995283533824")

const serverlistchannel = bot.channels.get("413831069117186078")

const swears = require("./swears.js")

var mysql = require('mysql')

const modulename = "joinguild"

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
		if(message.content == "+restart joinguild") {
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



bot.on("guildCreate", (guild) => {
	const logchannel = bot.channels.get("399688995283533824")
	const serverlistchannel = bot.channels.get("413831069117186078")
    const botowner = bot.users.get("142408079177285632")
	botowner.send(`${guild.owner} ${guild.ownerID} Invited JacobSux to server ${guild.name} ${guild.id}... Awaiting Approval`)
 console.log(`Joined ${guild.name}`)
 var newguildchannel = guild.channels.find("name", "general");
 if(newguildchannel) {
 newguildchannel.send("Hello! Thanks for inviting me!!! Do +support for the support server! If the discord owner can join so that they can be set as a representative of the server, that'd be great! I hope we have a great time together!!")
 newguildchannel.createInvite({maxAge:  0}).then(invite =>
 serverlistchannel.send(`${guild.name} Owned By ${guild.owner} - ${invite.url}`)
 )
 } else {
	 serverlistchannel.send(`${guild.name} Owned By ${guild.owner} - no invite`)
 }
  logchannel.send(`Joined new server! ${guild.name}`)
 bot.user.setGame('In ' + bot.guilds.size + ' servers!');
 guild.owner.send("Hello! Thanks for inviting me to your server, PLEASE join the support/log server so you can be represented! https://discord.gg/mx6Gcdb -- After joining, a short time later you will receive the server owner role!")
 var info = {

	"serverid": guild.id,

	"censor": true,

	"servername": guild.name,
	
	"serverownerid": guild.ownerID
	
}
connection.query("INSERT INTO censorbot SET ?", info)
 });


//



bot.login(auth.token);





