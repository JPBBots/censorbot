module.exports = function(bot, connection, stuff, auth) {
const modulename = "editedswearfilter"
const swears = require("./swears.json")
const byp = require('./byp.json')
var statuslog = bot.channels.get("450444337357258772")
var logchannel = bot.channels.get("399688995283533824")
var serverlistchannel = bot.channels.get("413831069117186078")
var botowner = bot.users.get("142408079177285632")
 



bot.on('messageUpdate', async (newMessage, oldMessage, guild) => {
	if(!oldMessage.guild) return;
	if(oldMessage.channel.nsfw) return;
	if(oldMessage.guild.id == "264445053596991498") return;
	if(oldMessage.guild.id == "110373943822540800") return;
  if(oldMessage.author.bot) return;
  if(oldMessage.channel.id == "463137032177451008") return;

  
							
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
		let yas = {
			"embed": {
			  "title": "Deleted Edited Message",
			  "color": 16452296,
			  "timestamp": "",
			  "footer": {
				"icon_url": "https://cdn.discordapp.com/app-icons/394019914157129728/2759df1fe0b8ec03a26c5645bc19c652.png",
				"text": "If you believe this was a mistake run +ticket word"
			  },
			  "thumbnail": {
				"url": oldMessage.author.avatarURL
			  },
			  "fields": [
				{
				  "name": "User",
				  "value": oldMessage.author + "",
				  "inline": true
				},
				{
				  "name": "Channel",
				  "value": oldMessage.channel + "",
				  "inline": true
				},
				{
				  "name": "Time",
				  "value": Date() + ""
				},
				{
				  "name": "Message",
				  "value": oldMessage.content + ""
				}
			  ]
			}
		  }
		  logchannelxd.send(yas)
	}
		})
	console.log(crash).catch(err => {
			if(err) return;
	})
	}
	
	if(oldMessage.content.match(/(f uck|fu ck|Pu.ssy|P.ussy|Puss.y|b i t c|b itc|d l c|dlc|c u n t|d 1 c|n l g|n!g|fa g|f4g|f 4 g|f a g |f @ g|f u c k|f u k|f.u.c|🇫🇺🇨|🇫 🇺 🇨|🇦🇸🇸|🇦 🇸 🇸|🇧🇮🇹🇨|🇧 🇮 🇹 🇨|🇩🇮🇨|🇩 🇮 🇨|🇨🇺🇳🇹|🇨 🇺 🇳 🇹|🇳🇮🇬|🇳 🇮 🇬|🇸🇭🇮🇹|🇸 🇭 🇮 🇹|🇫🇦🇬|🇫 🇦 🇬|🇵🇴🇷🇳|🇵 🇴 🇷 🇳|🇹🇮🇹|🇹 🇮 🇹|🇨🇴🇨|🇨 🇴 🇨|🇧🇦🇸🇹|🇧 🇦 🇸 🇹|🇸🇱🇺🇹|🇸 🇱 🇺 🇹|🇷🇪🇹🇦🇷🇩|🇷 🇪 🇹 🇦 🇷 🇩|🇵🇺🇸🇸🇾|🇵 🇺 🇸 🇸 🇾|🇨🇺🇲|🇨 🇺 🇲)/gi)) {
		stopped();
		console.log(crash)
	}
   	const arg = oldMessage.content.slice().trim().split(/ +/g)
 
		const words = swears.var
			
			const arrays = byp
			

		arg.forEach(arg => {
			words.forEach(words => {
				let word = new RegExp (words, 'gi')
				if(arg.match(word)) {
                  const array = arrays[words.toLowerCase()]
					if(array[0]) { 
					let sio1 = new RegExp (array[0], 'gi') 
					if(arg.match(sio1)) return; 
					}
					if(array[1]) { 
					let sio2 = new RegExp (array[1], 'gi') 
					if(arg.match(sio2)) return; 
					}
					if(array[2]) { 
					let sio3 = new RegExp (array[2], 'gi') 
					if(arg.match(sio3)) return; 
					}
					if(array[3]) { 
					let sio4 = new RegExp (array[3], 'gi') 
					if(arg.match(sio4)) return; 
					}
					if(array[4]) { 
					let sio5 = new RegExp (array[4], 'gi') 
					if(arg.match(sio5)) return; 
					}
					if(array[5]) { 
					let sio6 = new RegExp (array[5], 'gi') 
					if(arg.match(sio6)) return; 
					}
					if(array[6]) {
					let sio7 = new RegExp (array[6], 'gi') 
					if(arg.match(sio7)) return; 
					}
					if(array[7]) { 
					let sio8 = new RegExp (array[7], 'gi') 
					if(arg.match(sio8)) return; 
					}
					if(array[8]) { 
					let sio9 = new RegExp (array[8], 'gi') 
					if(arg.match(sio9)) return; 
					}
					if(array[9]) {
					let sio10 = new RegExp (array[9], 'gi') 
					if(arg.match(sio10)) return; 
					}
					if(array[10]) { 
					let sio11 = new RegExp (array[10], 'gi') 
					if(arg.match(sio11)) return; 
					}
					if(array[11]) { 
					let sio12 = new RegExp (array[11], 'gi') 
					if(arg.match(sio12)) return; 
					}
					if(array[12]) { 
					let sio13 = new RegExp (array[12], 'gi') 
					if(arg.match(sio13)) return; 
					}
					if(array[13]) { 
					let sio14 = new RegExp (array[13], 'gi') 
					if(arg.match(sio14)) return; 
					}
					if(array[14]) { 
					let sio15 = new RegExp (array[14], 'gi') 
					if(arg.match(sio15)) return; 
					}
					if(array[15]) { 
					let sio16 = new RegExp (array[15], 'gi') 
					if(arg.match(sio16)) return; 
					}
					if(array[16]) { 
					let sio17 = new RegExp (array[16], 'gi') 
					if(arg.match(sio17)) return; 
					}
					if(array[17]) { 
					let sio18 = new RegExp (array[17], 'gi') 
					if(arg.match(sio18)) return; 
					}
					if(array[18]) { 
					let sio19 = new RegExp (array[18], 'gi') 
					if(arg.match(sio19)) return; 
					}
					if(array[19]) { 
					let sio20 = new RegExp (array[19], 'gi') 
					if(arg.match(sio20)) return; 
					}
					if(array[20]) { 
					let sio21 = new RegExp (array[20], 'gi') 
					if(arg.match(sio21)) return; 
					}
					if(array[21]) { 
					let sio22 = new RegExp (array[21], 'gi') 
					if(arg.match(sio22)) return; 
					}
					if(array[22]) { 
					let sio23 = new RegExp (array[22], 'gi') 
					if(arg.match(sio23)) return; 
					}
					if(array[23]) { 
					let sio24 = new RegExp (array[23], 'gi') 
					if(arg.match(sio24)) return; 
					}
					if(array[24]) { 
					let sio25 = new RegExp (array[24], 'gi') 
					if(arg.match(sio25)) return; 
					}
					let linkreg = new RegExp ("youtube.com", 'gi') 
					if(arg.match(linkreg)) return;
					stopped();
					console.log(crash)
				}
			})
		})
  

});
}