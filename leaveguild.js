module.exports = function(bot, connection, stuff, auth) {

const modulename = "leaveguild"
var statuslog = bot.channels.get("450444337357258772")
var logchannel = bot.channels.get("399688995283533824")
var serverlistchannel = bot.channels.get("413831069117186078")
var botowner = bot.users.get("142408079177285632")
 

 let broken = 0

//


bot.on('message', async (message) => {
	if(message.content == "+apibreak") {
	const botowner = bot.users.get("142408079177285632")
	if(message.author != botowner || message.author.id != bot.user.id || bot.guilds.get("399688888739692552").roles.get("415323805943070721").members.has(message.author.id)) {
	broken = 1
	}
	}
})





bot.on("guildDelete", (guild) => {
	if(broken == 1) return;
		const joinandleave = bot.channels.get("456989243328299049")
        joinandleave.send(`${guild.owner} ${guild.ownerID} removed from server ${guild.name} ${guild.id}`)
	console.log(`Left ${guild.name}`)
	 const botowner = bot.users.get("142408079177285632")
	 botowner.send(`left ${guild.name}`)
	 connection.query("DELETE FROM censorbot WHERE serverid = " + guild.id)
})

//



}