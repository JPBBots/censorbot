module.exports = function(bot, connection, stuff, auth) {


const modulename = "mmo"
var statuslog = bot.channels.get("450444337357258772")
var logchannel = bot.channels.get("399688995283533824")
var serverlistchannel = bot.channels.get("413831069117186078")
var botowner = bot.users.get("142408079177285632")
 

 

//

	bot.on("guildMemberAdd", (member) => {
			if(member.guild.id == "399688888739692552") {
			var guildList = bot.guilds.array();
			console.log(`Checking If User ${member.name} ${member.id} Owns Server`)
            guildList.forEach(guild => {
				if(!guild.owner) return;
					if(member.id == guild.owner.id) {
						const autoowner = bot.channels.get("451537426867814402")
						console.log(`${member.name} Owns a Server, Role Given`)
						member.send("Welcome to The JacobSux Support Server! We have detected that you own a server, your role has been automatically given to you!")
						let role = member.guild.roles.find("name", "Server Owner");
						member.addRole(role);
						autoowner.send(`Gave ${member} ${member.id} Server Owner Role On Join`)
					}
			})
			}
});
	bot.on("guildDelete", (guild) => {
		const guildowner = bot.users.get(guild.owner.id)
		if(!guildowner) return;
		const supportserver = bot.guilds.get("399688888739692552")
		if(supportserver.members.has(guildowner.id)) {
			const autoowner = bot.channels.get("451537426867814402")
			let guildownermember = supportserver.member(guildowner.id)
			let role = supportserver.roles.find("name", "Server Owner");
			guildownermember.removeRole(role);
			autoowner.send(`Removed ${guildownermember} ${guildownermember.id} Server Owner Role On Deleted Guild`)
		}
})
	bot.on("guildCreate", (guild) => {
		const guildowner = bot.users.get(guild.owner.id)
		if(!guildowner) return;
		const supportserver = bot.guilds.get("399688888739692552")
		if(supportserver.members.has(guildowner.id)) {
			const autoowner = bot.channels.get("451537426867814402")
			let guildownermember = supportserver.member(guildowner.id)
			let role = supportserver.roles.find("name", "Server Owner");
			guildownermember.addRole(role);
			autoowner.send(`Gave ${guildownermember} ${guildownermember.id} Server Owner Role On New Guild`)
		}
	})

	bot.on('message', (message) => {
		if(message.content == "+mmo") {
			if(!message.guild) return;
			message.delete()
			message.reply("MMO Has been removed and replaced with an automatic system, if you did not receive server owner please DM an owner or helper or chat in the #support channel")
		}
	})

//

}