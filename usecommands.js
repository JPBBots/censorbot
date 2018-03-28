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


bot.on('message', async (message) => {
	if(!message.guild) return;
        const logchannel = bot.channels.get("399688995283533824")

if (message.content == '+help') {
	message.delete()
 const helpmsg = await message.reply(`Hello and thanks for using JacobSux, just for your information, this is non-customizable, atleast right now...
 (This Message will Self Destruct In 30 Seconds)
__+help__ : Displays this list
__+support__ : Sends invite to support server to DMs
__+inv__ : Sends link to invite
__+invite__ : Same as +inv
__+github__ : Displays the github link
__+update__ : Displays the most recent update to the bot
__+jsid__ : Displays the unique JacobSux Identifier for That Server
__+donate__ : Donate towards the development of JacobSux
`)
     setTimeout(function() {
		helpmsg.edit(":boom:")
		 setTimeout(function() {
		 helpmsg.delete()
	 }, 5000);	 
	 },25000 );
	console.log(`${message.author} ${message.author.username} Requested Help...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Help...`)
}
if (message.content == '+support') {
	message.delete()           
   const msg = await message.reply("Support Server Sent to DM's")
    setTimeout(function() {
msg.delete()
}, 6000);
    message.author.send('https://discord.gg/mx6Gcdb')
    console.log(`${message.author} ${message.author.username} Requested Support...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Support...`)
} 
if (message.content == '+inv') {
	message.delete()
    message.reply('`Invite me:` https://www.jt3ch.net/jacobsux')
    console.log(`${message.author} ${message.author.username} Requested an Invite...`)
    logchannel.send(`${message.author} ${message.author.username} Requested an Invite...`)
} 
if (message.content == '+invite') {
	message.delete()
    message.reply('`Invite me:` https://www.jt3ch.net/jacobsux')
    console.log(`${message.author} ${message.author.username} Requested an Invite...`)
    logchannel.send(`${message.author} ${message.author.username} Requested an Invite...`)
} 
if (message.content == '+github') {
		message.delete()           
   const msg = await message.reply("Github REPO Sent to DM's")
    setTimeout(function() {
msg.delete()
}, 6000);
    message.author.send('https://github.com/mcriper/jacobsux')
    console.log(`${message.author} ${message.author.username} Requested GitHub...`)
    logchannel.send(`${message.author} ${message.author.username} Requested GitHub...`)
} 
if (message.content == '+donate') {
	message.delete()
    message.reply('Donate (All goes towards development of new features/new products!): https://paypal.me/jpbberry')
    console.log(`${message.author} ${message.author.username} Requested Donation...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Donation...`)
} 
if (message.content == '+update') {
	message.delete()
  const updatemsg = await message.reply('Most recent updates: \n(This message will self destruct in 10seconds\n3/3/18: All channels set to NSFW (the little switch in the channel settings) will be ignored from cursing... \n2/26/18: Update command now self destructs after 10 seconds :>\n2/26/18: Help command now self destructs after 30s\n2/26/18: +support and +github now send links to DMs instead of in public chat\n2/26/18: Added the +github command\n2/24/18: All use commands (which can be listed with +help) Now delete request! Basically, If you type +help, youll get the commands, AND it will delete the "+help" command message...\n2/24/18: Added the +updates command :> \n(Too get updates on recent updates, join the discord! (+support) Have fun!)')
    setTimeout(function() {
		updatemsg.edit(":boom:")
		setTimeout(function() {
			updatemsg.delete()
		}, 1000)
	}, 9000);
	console.log(`${message.author} ${message.author.username} Requested Update...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Update...`)
} 
if (message.content == '+log') {
	message.delete()
  const logmsg = await message.reply('The Log server has been deleted, if you would like to log curses, add the channel by the name of #log, If you need the support server do +support')
    setTimeout(function() {
		logmsg.edit(":boom:")
		setTimeout(function() {
			logmsg.delete()
		}, 1000)
	}, 9000);
	console.log(`${message.author} ${message.author.username} Requested Log...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Log...`)
}
if (message.content == '+on') {
	if (!message.member.hasPermission('MANAGE_MESSAGES')) {
		message.reply("You can't do that! Contact your server owner/admin to toggle the chat filter!")
		return;
	}
 var on = {

	"serverid": message.guild.id,

	"censor": true,

	"servername": message.guild.name

}
connection.query("DELETE FROM censorbot WHERE serverid = " + message.guild.id)
connection.query("INSERT INTO censorbot SET ?", on)
message.delete()
console.log(`Turned On Filter for ${message.guild.name}`)
	}
	if (message.content == '+off') {
	if (!message.member.hasPermission('MANAGE_MESSAGES')) {
		message.reply("You can't do that! Contact your server owner/admin to toggle the chat filter!")
		return;
	}
 var on = {

	"serverid": message.guild.id,

	"censor": false,

	"servername": message.guild.name

}
connection.query("DELETE FROM censorbot WHERE serverid = " + message.guild.id)
connection.query("INSERT INTO censorbot SET ?", on)
message.delete()
console.log(`Turned On Filter for ${message.guild.name}`)
	}
  const args = message.content.slice().trim().split(/ +/g);
  const command = args.shift().toLowerCase();
	if(command === "+serveridlist") {
		message.delete()
		if(message.content == "+serveridlist") {
			message.reply("Error: Too little amount of arguments | format: +serveridlist ##")
			return;
		}
		let arg1 = args[0]
		connection.query("SELECT * FROM censorbot WHERE idcensorbot = " + arg1, function (err, rows) {
			if(err) throw err;
				
			
			let ids = rows[0].idcensorbot
			let servername = rows[0].servername
			let censor = rows[0].censor
			let serverids = rows[0].serverid
			
			let server = bot.guilds.get(serverids)
			let serverowner = server.owner
			
			message.reply(`
__JSID__ : ${ids}
__Server Name__ : ${servername}
__Owner__ : ${serverowner}
__Server ID__ : ${serverids}
__Censor(On/Off)__ : ${censor}
			`)

		})
		
	}
	
if(message.content == "+jsid") {
message.delete()
connection.query('SELECT * FROM censorbot WHERE serverid = ' + message.guild.id, (err, rows) => {



	let jsid = rows[0].idcensorbot;

	message.reply(`The JacobSux Identifier for this server is __` + jsid + `__

Keep in mind, this will change when you turn on or off the filter`)

	

	

	})

}




	if(command === "+generateinvite") {
		message.delete()
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) { 
			message.reply("You do not have permission to run this command!")
			return;
		}
		if(message.content == "+generateinvite") {
			message.reply("Error: Too little amount of arguments | format: +generateinvite ##")
			return;
		}
		let arg1 = args[0]
		connection.query("SELECT * FROM censorbot WHERE idcensorbot = " + arg1, function (err, rows) {
			if(err) throw err;
				
			
			let ids2 = rows[0].idcensorbot
			let servername2 = rows[0].servername
			let censor2 = rows[0].censor
			let serverids2 = rows[0].serverid
			let server2 = bot.guilds.get(serverids2)
			var generalchat = server2.channels.find("name", "general");
         generalchat.createInvite({maxUses:  1}).then(invite =>
		 message.author.send(`Invite Requested For ${servername2} ${invite.url}`)
		 )
		})
	}
});


//



bot.login(auth.token);





