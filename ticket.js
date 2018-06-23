const modulename = "ticket"


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


bot.on('message', async (message) => {
	const botowner = bot.channels.get("447482034063933451")
	const arg = message.content.slice().trim().split(/ +/g);
  const command = arg.shift().toLowerCase();
	if(command == "+ticket") {
   let arg1 = arg[0]
   let arg2 = arg[1]
   let arg3 = arg[2]

if(!message.guild) {
var sent = "DMs"
}
if(message.guild) {
var sent = `Server: ${message.guild.name} ${message.guild.id}`
}
console.log(`ticket from ${sent} asked`)	
  if(!arg1) {
   message.reply("Ticket system: Create a ticket for support, botproblem, or word... Support: Asking about features etc botproblem: Submit a problem with the bot such as not censoring etc. word: Submit word(s) that are censored when they're no supposed to be")
message.delete()
}
if(arg1 == "support") {
if(!arg2) {
message.reply("Usage: +ticket support <Support question or report>")
return;
}
botowner.send(`Support ticket submitted by ${message.author} via ${sent}: 
${message.content}`)
console.log("support ticket sent")
message.reply("Support ticket has been sent! Warning: certified helper or owner may generate invite and join the server to discuss and help you with bot problems! By submitting a ticket you agree to allow JacobSux owner and trustees access to your server's ID in order to generate an invite")
}
if(arg1 == "botproblem") {
if(!arg2) {
message.reply("Usage: +ticket botproblem <Problem occurring>")
return;
}
botowner.send(`Bot problem ticket submitted by ${message.author} via ${sent}: 
${message.content}`)
console.log("bot problem ticket sent")
message.reply("Bot problem ticket has been sent! Your problem should be resolved in 1-3 hours :)")
}
if(arg1 == "word") {
if(!arg2) {
message.reply("Usage: +ticket word <Word/Phrase that is censored and shouldn't be>")
return;
}
message.reply("Word ticket submitted! If the word is not fixed in a 1-3 hours do +support and join the support discord and explain your reasoning because it was most likely denied! (As this is a word report, the command you ran was most likely deleted for innapropriate, BUT DON'T WORRY! I can confirm the ticket was sent :)")
botowner.send(`Word ticket submitted by ${message.author} via ${sent}: 
${message.content}`)
console.log("Word ticket sent")
}
if(!arg1 == "botproblem") {
	if(!arg1 == "support") {
		if(!arg1 == "word") {
		 if(arg1) {
message.reply("Error submitting ticket, most likely wrong second argument, use support, botproblem, or word, nothing else, if there is still a problem run +support")
return;
}}}}

}
});


//



bot.login(auth.token);