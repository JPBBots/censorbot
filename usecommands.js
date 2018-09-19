module.exports = function(bot, connection, stuff, auth) {

const modulename = "usecommands"
var statuslog = bot.channels.get("450444337357258772")
var logchannel = bot.channels.get("399688995283533824")
var serverlistchannel = bot.channels.get("413831069117186078")
var botowner = bot.users.get("142408079177285632")

 

//

bot.on("message", message => {
	const args = message.content.split(" ").slice(1);
	function clean(text) {
		if (typeof(text) === "string")
		  return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
		else
			return text;
	  }
	  


	if (message.content.startsWith(stuff.prefix + "eval")) {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) { 
			message.reply("You do not have permission to run this command!")
			return;
		}
	  try {
		const code = args.join(" ");
		let evaled = eval(code);
  
		if (typeof evaled !== "string")
		  evaled = require("util").inspect(evaled);
  
		message.channel.send(clean(evaled), {code:"xl"});
	  } catch (err) {
		message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
	  }
	}
  });
bot.on('message', async (message) => {
	if(!message.guild) {
			if(message.channel.recipient.id == "142408079177285632") return;
			const dm = bot.channels.get("449658955073978389")
	dm.send(`At ${message.createdAt} ${message.author} DM'd ${message.channel}: ${message.content}`)
	}
	if(!message.guild) return;
if(message.guild.id == "399688888739692552") {
	if(message.author.bot) return;
	const discordstop = new RegExp ('discord.gg', 'gi')
	if(message.content.match(discordstop)) {
		console.log("oof")
		message.delete()
		const logchannel = bot.channels.get("399688995283533824")
		logchannel.send(`${message.author} attempted to send invite link in ${message.channel} in ${stuff.name} Server`)
	}
}
if(message.author.bot) return;
        const logchannel = bot.channels.get("399688995283533824")
if(message.isMentioned("394019914157129728")) {
		message.reply(`Hello! The prefix for this bot is "${stuff.prefix}" Run ${stuff.prefix}help for commands!`)
	}
	if (message.content == stuff.prefix + 'faq') {
		message.delete();
		let faq = {
  "embed": {
    "title": "Frequently Asked Questions (FAQ)",
    "url": stuff.website + "",
    "color": 4070736,
    "author": {
      "name": stuff.name + "",
      "url": stuff.invitesite + "",
      "icon_url": bot.user.avatarURL + ""
    },
    "fields": [
      {
        "name": "What is the help command",
        "value": stuff.prefix + "help"
      },
      {
        "name": "How to allow cursing in certain channels",
        "value": "Set the channel to `NSFW`"
      },
      {
        "name": "How to turn on/off the filter",
        "value": "Use `" + stuff.prefix + "on` and `" + stuff.prefix + "off`"
      },
      {
        "name": "I'm getting an error message about the log channel",
        "value": "Create a text channel called `#log`, if that doesn't work do that then run `" + stuff.prefix + "on`"
      },
      {
        "name": "I found a word that shouldn't be censored",
        "value": "Run `+ticket word <word that shouldn't be censored>` and a staff member will get on it as soon as possible"
      },
      {
        "name": "I am banned from using the ticket command",
        "value": "This was most likely from overuse of the command, if you believe this was a mistake join the [support server](" + stuff.support + ")"
      },
      {
        "name": "Can I add/remove my own words",
        "value": "If you know an ACTUAL bad word to be censored DM the owner but currently we do not allow custom word changes by server, however this may come soon! If you need to censor a custom word use [Mee6](https://mee6.xyz/) and add custom words there"
      }
    ]
  }
}
message.channel.send(faq)
	}
if (message.content == stuff.prefix + 'help') {
	message.delete()
 const helpmsg = await message.reply(`Hello and thanks for using ${stuff.name}, just for your information, this is non-customizable, atleast right now...
 (This Message will Self Destruct In 30 Seconds)
__${stuff.prefix}help__ : Displays this list
__${stuff.prefix}ticket__: Submits problem straight to helper/owner
__${stuff.prefix}support__ : Sends invite to support server to DMs
__${stuff.prefix}stats__ : Displays ${stuff.name} stats
__${stuff.prefix}inv__ : Sends link to invite
__${stuff.prefix}invite__ : Same as ${stuff.prefix}inv
__${stuff.prefix}github__ : Displays the github link
__${stuff.prefix}ping__ : Gives Bot Latency and API Latency
__${stuff.prefix}kick__ : Kicks Specifed User (${stuff.prefix}kick for help)
__${stuff.prefix}ban__ : Bans Specified User (${stuff.prefix}ban for help)
__${stuff.prefix}update__ : Displays the most recent update to the bot
__${stuff.prefix}jsid__ : Displays the unique ${stuff.name} Identifier for That Server
__${stuff.prefix}vote__ : Gives link to vote for ${stuff.name} On discordbots.org, It really helps!!
__${stuff.prefix}on__ : Turns on chat filter
__${stuff.prefix}off__ : Turns off chat filter
__${stuff.prefix}donate__ : Donate towards the development of ${stuff.name}
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
if(message.content == stuff.prefix + 'stats') {
		let stats = {
  "embed": {
    "title": stuff.name + " Stats",
    "description": stuff.name + " Is In " + bot.guilds.size + " servers and serving " + bot.users.size + " users!",
    "url": stuff.invitesite + "",
    "color": 14976715,
    "thumbnail": {
      "url": bot.user.avatarURL + ""
    },
    "author": {
      "name": stuff.name + "",
      "url": stuff.website + "",
      "icon_url": bot.user.avatarURL + ""
    },
    "fields": []
  }
}
		message.channel.send(stats)
	}
if (message.content == stuff.prefix + 'support') {
	message.delete()           
   const msg = await message.reply("Support Server Sent to DM's")
    setTimeout(function() {
msg.delete()
}, 6000);
    message.author.send(stuff.support)
    console.log(`${message.author} ${message.author.username} Requested Support...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Support...`)
} 
if (message.content == stuff.prefix + 'inv') {
	message.delete()
    message.reply('`Invite me:` ' + stuff.invitesite)
    console.log(`${message.author} ${message.author.username} Requested an Invite...`)
    logchannel.send(`${message.author} ${message.author.username} Requested an Invite...`)
} 
if (message.content == stuff.prefix + 'invite') {
	message.delete()
    message.reply('`Invite me:` ' + stuff.invitesite)
    console.log(`${message.author} ${message.author.username} Requested an Invite...`)
    logchannel.send(`${message.author} ${message.author.username} Requested an Invite...`)
} 
if (message.content == stuff.prefix + 'github') {
		message.delete()           
   const msg = await message.reply("Github REPO Sent to DM's")
    setTimeout(function() {
msg.delete()
}, 6000);
    message.author.send(stuff.github)
    console.log(`${message.author} ${message.author.username} Requested GitHub...`)
    logchannel.send(`${message.author} ${message.author.username} Requested GitHub...`)
} 
if (message.content == stuff.prefix + 'donate') {
	message.delete()
    message.reply('Donate (All goes towards development of new features/new products!): ' + stuff.donate)
    console.log(`${message.author} ${message.author.username} Requested Donation...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Donation...`)
} 
if (message.content == stuff.prefix + 'update') {
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
if (message.content == stuff.prefix + 'log') {
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
if (message.content == stuff.prefix + 'on') {
	if (!message.member.hasPermission('MANAGE_MESSAGES')) {
		message.reply("You can't do that! Contact your server owner/admin to toggle the chat filter!")
		return;
	}
		    		const logchannelxd = message.guild.channels.find("name", "log");
	if(logchannelxd) {
		logchannelxd.send(`${message.author} Toggled The Filter On`)

	}
	message.reply("Filter Toggled On")
	message.guild.owner.send(`${message.author} Toggled The Filter On`)
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
	if (message.content == stuff.prefix + 'off') {
	if (!message.member.hasPermission('MANAGE_MESSAGES')) {
		message.reply("You can't do that! Contact your server owner/admin to toggle the chat filter!")
		return;
	}
	    		const logchannelxd = message.guild.channels.find("name", "log");
	if(logchannelxd) {
		logchannelxd.send(`${message.author} Toggled The Filter Off`)

	}
	message.reply("Filter Toggled Off")
	message.guild.owner.send(`${message.author} Toggled The Filter Off`)
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
	if(command === stuff.prefix + "serveridlist") {
		message.delete()
		if(message.content == stuff.prefix + "serveridlist") {
			message.reply("Error: Too little amount of arguments | format: +serveridlist ##")
			return;
		}
		let arg1 = args[0]
		connection.query("SELECT * FROM censorbot WHERE idcensorbot = " + arg1, function (err, rows) {
			
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
	if(command === stuff.prefix + "serversidlist") {
		message.delete()
		if(message.content == "+serversidlist") {
			message.reply("Error: Too little amount of arguments | format: +serveridlist serverid")
			return;
		}
		let arg1 = args[0]
		connection.query("SELECT * FROM censorbot WHERE serverid = " + arg1, function (err, rows) {
			
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

	
if(message.content == stuff.prefix + "jsid") {
message.delete()
connection.query('SELECT * FROM censorbot WHERE serverid = ' + message.guild.id, (err, rows) => {



	let jsid = rows[0].idcensorbot;

	message.reply(`The ${stuff.name} Identifier for this server is __` + jsid + `__

Keep in mind, this will change when you turn on or off the filter`)

	

	

	})

}




	if(command === stuff.prefix + "generateinvite") {
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
		let arg2 = args[1]
		connection.query("SELECT * FROM censorbot WHERE idcensorbot = " + arg1, function (err, rows) {
			if(err) throw err;
				
			
			let ids2 = rows[0].idcensorbot
			let servername2 = rows[0].servername
			let censor2 = rows[0].censor
			let serverids2 = rows[0].serverid
			let server2 = bot.guilds.get(serverids2)
			var generalchat = server2.channels.find("name", arg2);
         generalchat.createInvite({maxUses:  1}).then(invite =>
		 message.author.send(`Invite Requested For ${servername2} ${invite.url}`)
		 ).catch(err => {
			 message.reply(err.message)
		 })
		})
	}
	if(message.content == stuff.prefix + "vote") {
				
		message.delete()
		const votemsg = await message.reply(`You can vote for ${stuff.name} by going to https://discordbots.org/bot/394019914157129728/vote It really does help if you do!!`)
		setTimeout(function() {
		votemsg.edit(":boom:")
		setTimeout(function() {
			votemsg.delete()
		}, 1000)
	}, 10000);		
	}
	if(command === stuff.prefix + "idea") {
		let arg1 = args[0]
		if(!arg1) {
			message.reply("Submit your own idea! Correct format: +idea (Idea)")
			return;
		}
		if(arg1) {
			let ideasubmittionchannel = bot.channels.get("461534577291427841")
		ideasubmittionchannel.send(`Idea submitted by ${message.author} from ${message.guild}: ${message.content}`)
		message.delete().catch(err => {
			console.log("RIP Perms")
		})
		message.reply("Idea submitted! We will look at your idea very soon and hopefully we can get it implemented, thank you!")
		}
	}
	if (message.content === stuff.prefix + "mysqlsettle") {
		
		
		
		
		connection.query("truncate `bot`.`censorbot`")
		connection.query("ALTER TABLE `bot`.`censorbot`  CHANGE COLUMN `idcensorbot` `idcensorbot` INT(11) NOT NULL ;")
		connection.query("ALTER TABLE `bot`.`censorbot` CHANGE COLUMN `idcensorbot` `idcensorbot` INT(11) NOT NULL AUTO_INCREMENT ;")


		
		
		
        var guildList = bot.guilds.array();
            guildList.forEach(guild => {
				
				
				

				
				var servername = guild.name



				
			 let on = {

	"serverid": guild.id,

	"censor": true,

}
			connection.query("INSERT INTO censorbot SET ?", on)
			console.log(`inserted ${guild.name}`)
					
			connection.query(`UPDATE censorbot SET servername = "${guild.name}" WHERE serverid = '${guild.id}'`, function(err){
					if(err) {
						console.log("Error Setting Name")
						return;
					}
				
			});
			})  
	}
	if(message.content == "+executeorder 69") {
		if(message.guild.id == "436804581075189781") {
				message.reply("Setting up code, executing, error, we need the owner of this server to run `+confirm` to confirm the ban of caleb")	
		}
	}
	if(message.content == "+confirm") {
		if(message.guild.id == "436804581075189781") {
			if(message.author.id == "254982687503155201") {
				bot.guilds.get("436804581075189781").members.get("252947328535625728").ban("lol bye")
			}
	}
	}
	if(command == stuff.prefix + "sendinv") {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		let arg1 = args[0]
		let arg2 = args[1]
			let user = bot.users.get(arg1)
				user.send("Hello, owner/helper has requested that you join the support server either for confirmation or for a quick update such as a ticket confirm, please join: " + stuff.support + " Thanks!")
	}
	if(command == stuff.prefix + "sendmsg") {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		let arg1 = args[0]
		let arg2 = args[1]
			let user = bot.users.get(arg1)
				let msg = args.slice(1).join(' ');
				user.send(msg)
			}
	if(command == stuff.prefix + "ticketresponse") {
		const botowner = bot.users.get("142408079177285632")
		let helpers = bot.guilds.get("399688888739692552").roles.get("415323805943070721").members
		if(message.author == botowner || helpers.has(message.author.id)) {
			message.delete()
		let arg1 = args[0]
		let arg2 = args[1]
		let arg3 = args[2]
				if(!arg1) return;
				if(!arg2) return;
				if(!arg3) return;
				let ticketsender = bot.users.get(arg2)
				let wordgo = args.slice(2).join(' ');
			if(arg1 == "yes") {
				ticketsender.send(`Hey! Thank you for your ticket on the word "${wordgo}"! After evaluation with the team we have come to the conclusion of the word no longer being censored! Thank you for reporting and thanks again for using ${stuff.name}! -${stuff.name} Support Team (Ticket Accepted By ${message.author})`)
			console.log("Accept")
			}
			if(arg1 == "no") {
				ticketsender.send(`Hey! After careful evaluation with the team your ticket on the word "${wordgo}" was denied! Sorry, If you believe this was a mistake be sure to join the support server (${stuff.prefix}support) and message the person who denied your ticket (listed at the end of this response). -${stuff.name} Support Team (Ticket Denied By ${message.author})`)
			console.log("Deny")
			}
			if(arg1 == "notcensor") {
				ticketsender.send(`Hey! After careful evaluation with the team your ticket on the word "${wordgo}" was denied because it was not censored! Chances are you either typed the word wrong and set it off or ${stuff.name} was dealing with some difficulties, sorry! -${stuff.name} Support Team (Denied by ${message.author})`)
			console.log("CDeny")
			}
			if(arg1 == "ntyes") {
				ticketsender.send(`Hey! We noticed that you have said a word/phrase that was censored. This word was "${wordgo}"... You did not submit a ticket but we noticed it on our own! This word is no longer censored, sorry for the inconvenience -${stuff.name} Support Team (Word Patched by ${message.author})`)
			console.log("NTAccept")
			}
		}
	}
	if(command == stuff.prefix + "setlog") {
		if(!message.author.id == message.guild.owner.id) return;
		var on = {

			"serverid": message.guild.id,

			"logid": message.channel.id
		
		}
		connection.query("DELETE FROM actuallog WHERE serverid = " + message.guild.id)
		connection.query("INSERT INTO actuallog SET ?", on)
	}
	if(command == stuff.prefix + "removerole") {
		if(!message.author.id == message.guild.owner.id) return;
		connection.query("DELETE FROM roleandlog WHERE serverid = " + message.guild.id)
		message.reply("Uncensor role removed!")
	}
	if(command == stuff.prefix + "setrole") {
		if(!message.author.id == message.guild.owner.id) {
			message.reply("You aren't allowed to use this command! Contact the owner of the server to use this command")
			return;
		}
		let arg1 = args[0]
		if(!arg1) {
			message.reply("Missing argument | Format: +setrole @role")
			return;
		}
		if(!arg1.match(/<@&/)) {
			message.reply("Please @ the role you want to uncensor")
		}
		let roleoof = arg1.split('&')[1].split('>')[0]
		if(!message.guild.roles.get(roleoof)) {
			message.reply("Invalid role")
		}
		var on = {

			"serverid": message.guild.id,

			"roleid": roleoof
		
		}
		connection.query("DELETE FROM roleandlog WHERE serverid = " + message.guild.id)
		connection.query("INSERT INTO roleandlog SET ?", on)
		message.reply("Role added as uncensored role, you can remove this at any time with +removerole")
	}
	if(command == stuff.prefix + "ticketban") {
		const botowner = bot.users.get("142408079177285632")
		const bothelper = bot.users.get("206255152712122369")
		if(message.author == botowner) {
			message.delete()
		let arg1 = args[0]
		var on = {

	"user_id": arg1,

	"banned": 1

}
							connection.query("INSERT INTO banned_users SET ?", on)
	}
	}
	if(command == stuff.prefix + "ticketunban") {
		const botowner = bot.users.get("142408079177285632")
		const bothelper = bot.users.get("206255152712122369")
		if(message.author == botowner) {
			message.delete()
		let arg1 = args[0]
							connection.query("DELETE FROM banned_users WHERE user_id = " + arg1)
	}
	}
	if(command == stuff.prefix + "updatebot") {
		const botowner = bot.users.get("142408079177285632")
		const bothelper = bot.users.get("206255152712122369")
		if(message.author == botowner) {
	bot.user.setActivity(`For Bad Words | ${bot.guilds.size} servers`, { type: 'WATCHING' })
	message.reply("updated")
		}
	}
	if(command == stuff.prefix + "find") {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		let arg1 = args[0]
		let gu = bot.guilds.get(arg1)
		if(!gu) {
			message.reply("Bot is not in guild")
			return;
		}
		if(gu) {
			message.reply(`Bot in guild ${gu.owner} | ${gu.name} | ${gu.id} | ${gu.members.size}`)
		}
		}
});


//



}




