module.exports = function(bot, connection, stuff, auth) {
const modulename = "joinguild"
const swears = require("./swears.json")
var curses = new RegExp (swears.var, 'gi')
var statuslog = bot.channels.get("450444337357258772")
var logchannel = bot.channels.get("399688995283533824")
var serverlistchannel = bot.channels.get("413831069117186078")
var botowner = bot.users.get("142408079177285632")
 


//



bot.on("guildCreate", (guild) => {
	const joinandleave = bot.channels.get("456989243328299049")
	const logchannel = bot.channels.get("399688995283533824")
	const serverlistchannel = bot.channels.get("413831069117186078")
    const botowner = bot.users.get("142408079177285632")
	joinandleave.send(`${guild.owner} ${guild.ownerID} to server ${guild.name} ${guild.id}`)
	botowner.send(`${guild.owner} ${guild.ownerID} Invited JacobSux to server ${guild.name} ${guild.id}... Awaiting Approval`)
 console.log(`Joined ${guild.name}`)
 var newguildchannel = guild.channels.find("name", "general");
 if(newguildchannel) {
 newguildchannel.send("Hello! Thanks for inviting me!!! Do +support for the support server! If the discord owner can join so that they can be set as a representative of the server, that'd be great! I hope we have a great time together!!")
 newguildchannel.createInvite({maxAge:  0}).then(invite =>
 serverlistchannel.send(`${guild.name} Owned By ${guild.owner} - ${invite.url}`)
 )
 }
if(!newguildchannel) {
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



}





