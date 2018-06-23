const modulename = "mmo"


const Discord = require('discord.js');
const bot = new Discord.Client();
const auth = require('./auth.json')
var mysql = require('mysql')
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

bot.login(auth.token)