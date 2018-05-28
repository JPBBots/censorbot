const Discord = require('discord.js');

const bot = new Discord.Client();

const auth = require('./auth.json')

const logchannel = bot.channels.get("399688995283533824")

const serverlistchannel = bot.channels.get("413831069117186078")

const swears = require("./swears.json")

var mysql = require('mysql')

var curses = new RegExp (swears.var, 'gi')

const modulename = "editedswearfilter"

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
		if(message.content == "+restart editedswearfilter") {
		const botowner = bot.users.get("142408079177285632")
		if(message.author != botowner) return;
		message.delete();
			connection.query("CRASH")
	}
		if(message.content == "+modulesonline") {
		message.channel.send(`${modulename} = Online (10 In Total)`)
	}
});

bot.on('ready', () => {
    console.log('sector on');
	const statuslog = bot.channels.get("450444337357258772")
statuslog.send(`${Date().toLocaleString()} Module Started: ${modulename}`)
});

bot.on('messageUpdate', async (newMessage, oldMessage, guild) => {
	if(!oldMessage.guild) return;
	if(oldMessage.channel.nsfw) return;
	if(oldMessage.guild.id == "264445053596991498") return;
	if(oldMessage.guild.id == "110373943822540800") return;
  if(oldMessage.author.bot) return;

  
							
	async function stopped() {
		connection.query("SELECT * FROM censorbot WHERE serverid = " + oldMessage.guild.id, async function (err, rows) {
						if(err) {
							 var on = {

	"serverid": oldMessage.guild.id,

	"censor": true,
	
	"serverowner": oldMessage.guild.owner

}
							connection.query("INSERT INTO censorbot SET ?", on)
							return;
						}
							let censor = rows[0].censor
							if(censor == false) return;
		oldMessage.delete().catch(err => {
			console.log(`${oldMessage.guild.name} ${oldMessage.guild.id} Missing perms`)
		})
   const popnomsg = await oldMessage.reply("You're not allowed to say that... | Mistake? Do: +ticket word")
    setTimeout(function() {
popnomsg.delete()
}, 3000);
	
    console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id}`)   
    		const logchannelxd = oldMessage.guild.channels.find("name", "log");
		if(!logchannelxd) {
			oldMessage.channel.send("error! no log channel found! Be sure to create a #log chat so I can log the curses!")
		}
	if(logchannelxd) {
		logchannelxd.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.tag} ${oldMessage.author.username}: ${oldMessage.content} | Channel: ${oldMessage.channel.name} ${oldMessage.channel.id} | If you believe this was a mistake run +ticket word`)

	}
		})
	console.log(crash).catch(err => {
			if(err) return;
	})
	}
	
	if(oldMessage.content.match(/(Pu.ssy|P.ussy|Puss.y|b i t c|bit c|b itc|b it c|d l c|dlc| dic|c u n t|d 1 c|n l g|n!g|f ag|fa g|f4g|f 4 g|f a g |f @ g|f u c k|f u k|f.u.c)/gi)) {
		stopped();
		console.log(crash)
	}
   	const arg = oldMessage.content.slice().trim().split(/ +/g)
 
		arg.forEach(arg => {
				if(arg.match(/ass/gi)) {
					if(arg.match(/assum/)) return;
					if(arg.match(/rass/)) return;
					if(arg.match(/assa/gi)) return;
					if(arg.match(/asse/gi)) return;
					if(arg.match(/asso/gi)) return;
					if(arg.match(/glass/gi)) return;
					if(arg.match(/bass/gi)) return;
					if(arg.match(/lass/gi)) return;
					if(arg.match(/mass/gi)) return;
					if(arg.match(/pass/gi)) return;
					if(arg.match(/sass/gi)) return;
					if(arg.match(/tass/gi)) return;
					if(arg.match(/brass/gi)) return;
					if(arg.match(/bypass/gi)) return;
					if(arg.match(/class/gi)) return;
					if(arg.match(/yas/gi)) return;
					if(arg.match(/assist/gi)) return;
					if(arg.match(/assig/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/bitc/gi)) {
					
					stopped();
					console.log(crash)
				}
				if(arg.match(/dic/gi)) {
					if(arg.match(/adic/gi)) return;
					if(arg.match(/dict/gi)) return;
					if(arg.match(/dice/gi)) return;
					if(arg.match(/acidic/gi)) return;
					if(arg.match(/dicate/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/cunt/gi)) {
					stopped();
					console.log(crash)
				}
				if(arg.match(/nig/gi)) {
					if(arg.match(/nigh/gi)) return;
					if(arg.match(/snig/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/shit/gi)) {
					stopped();
					console.log(crash)
				}
				if(arg.match(/fuc/gi)) {
					if(arg.match(/fuch/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/fag/gi)) {
					if(arg.match(/fage/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/porn/gi)) {
					stopped();
					console.log(crash)
				}
				if(arg.match(/tit/gi)) {
					if(arg.match(/tita/gi)) return;
					if(arg.match(/tith/gi)) return;
					if(arg.match(/entity/gi)) return;
					if(arg.match(/titl/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/coc/gi)) {
					stopped();
					console.log(crash)
				}
				if(arg.match(/bast/gi)) {
					if(arg.match(/basti/gi)) return;
					if(arg.match(/baster/gi)) return;
					if(arg.match(/basts/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/slut/gi)) {
					stopped();
					console.log(crash)
				}
				if(arg.match(/retard/gi)) {
					if(arg.match(/retardant/gi)) return;
					stopped();
					console.log(crash)
				}
				if(arg.match(/pussy/gi)) {
					stopped();
					console.log(crash)
				}
			})
  

});
bot.login(auth.token)