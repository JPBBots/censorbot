const modulename = "nicknamefilter"


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
bot.on('guildMemberUpdate', (newMember, oldMember, guild) => {
   
	
   
   if(oldMember.guild.id == "264445053596991498") return;
   if(oldMember.guild.id == "110373943822540800") return;
var crash = "hi"
  
							
	async function stopped() {
		connection.query("SELECT * FROM censorbot WHERE serverid = " + oldMember.guild.id, async function (err, rows) {
						if(err) {
							 var on = {

	"serverid": oldMember.guild.id,

	"censor": true,
	
	"serverowner": oldMember.guild.owner

}
							connection.query("INSERT INTO censorbot SET ?", on)
							return;
						}
							let censor = rows[0].censor
							if(censor == false) return;
		oldMember.setNickname(' ').catch(err => {
			console.log(`${guild.name} ${guild.id} Missing perms`)
		})
    console.log(`Changed username of ${oldMember.id} because it was innapropriate ${oldMember.displayName}`)   
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Changed username of ${oldMember.id} because it was innapropriate`) 

	
	      		const logchannelxd = oldMember.guild.channels.find("name", "log");

		

		console.log("xd")

		if(!logchannelxd) {

			return;

		}

	if(logchannelxd) {

		logchannelxd.send(`Changed ${oldMember}'s nickname because it was innapropriate (Was "${oldMember.displayName}")`)

	}
	
	})
	}
	
	if(oldMember.displayName.match(/(Pu.ssy|P.ussy|Puss.y|b i t c|bit c|b itc|b it c|d l c|dlc| dic|c u n t|d 1 c|n l g|n!g|f ag|fa g|f4g|f 4 g|f a g |f @ g|f u c k|f u k|f.u.c)/gi)) {
		stopped();
		console.log(crash)
	}
   	const arg = oldMember.displayName.slice().trim().split(/ +/g)
 
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
})
   
   
bot.login(auth.token);

