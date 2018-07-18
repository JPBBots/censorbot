module.exports = function(bot, connection, stuff, auth) {

const modulename = "leaveguild"
var statuslog = bot.channels.get("450444337357258772")
var logchannel = bot.channels.get("399688995283533824")
var serverlistchannel = bot.channels.get("413831069117186078")
var botowner = bot.users.get("142408079177285632")
 

 

//








bot.on("guildDelete", (guild) => {
		const joinandleave = bot.channels.get("456989243328299049")
        joinandleave.send(`${guild.owner} ${guild.ownerID} removed from server ${guild.name} ${guild.id}`)
	console.log(`Left ${guild.name}`)
	 const botowner = bot.users.get("142408079177285632")
	 botowner.send(`left ${guild.name}`)
	 bot.user.setGame('In ' + bot.guilds.size + ' servers!');
	 connection.query("DELETE FROM censorbot WHERE serverid = " + guild.id)
})

//



}