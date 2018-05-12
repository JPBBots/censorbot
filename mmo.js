const Discord = require('discord.js');

const bot = new Discord.Client();


const logchannel = bot.channels.get("399688995283533824")

const serverlistchannel = bot.channels.get("413831069117186078")


var mysql = require('mysql')


var connection = mysql.createConnection({



	host: "192.168.0.10",



	user: "bot",



	password: "passwordlmao",



	database: "bot"



}); 

bot.on("ready", () => {
console.log("sector on")
})



bot.on('message', async (message) => {
	
	if(!message.guild) return;

	
	const args = message.content.slice().trim().split(/ +/g);
  const command = args.shift().toLowerCase();
		
	
	if(command === "+mmo") {
		
			if(message.guild.id == "399688888739692552") {
		
		message.delete()
		
		if(message.content == "+mmo") {
			message.reply("Error: Too little amount of arguments | format: +mmo jsid | Get JSID by running +jsid in your discord server")
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
			let serverowner = server2.owner
			
			if(message.author.id == server2.owner.id) {
				
message.reply(`You have claimed ownership of ${servername2}`)
					
					let role = message.guild.roles.find("name", "Server Owner");
					let member = message.member
					
					
					member.addRole(role)
					
					console.log(`${message.author} claimed ownership of ${servername2}`)
					
			} else {
				
 message.reply(`Error! You are not the owner of the server you specified, make sure you are using the correct jsid by running +jsid in the server you are claiming ownership of, if that still doesnt work feel free to contact MCninja for manual confirmation`)

				
			}
			
		})
		} else {
		message.reply("Command: +mmo Is only available for use in the JacobSux Support discord, to join run +support")
	}
	}
	
})




bot.login('Mzk0MDE5OTE0MTU3MTI5NzI4.DZQ8jg.Nvpcun8JZDmA05k2DvWgriU3zLo');