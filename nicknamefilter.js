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
bot.on('guildMemberUpdate', (newMember, oldMember, guild) => {
   
if (oldMember.displayName.match(/(b i t c|bit c|b itc|b it c|kys|k y s|k ys|ky s|dick| dic |d l c|dlc|d i c| dic|cunt|c u n t|bitch|bish|shit|fuc|p0rn|nig|d1c|d 1 c|n l g|n i g|n 1 g|n1g|nlg|n!g|bast|wank|f ag|fa g|fag|f4g|f 4 g|f a g|f @ g|f@g|sex |tits|8--|8==|dild|porn|fuk|slut|whore|retard|f u c k|cock|nibba|f u k|f.u.c)/gi)) {
if (oldMember.guild.id !='110373943822540800' && oldMember.guild.id !='264445053596991498') {    
oldMember.setNickname(' ')
    console.log(`Changed username of ${oldMember.id} because it was innapropriate`)   
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Changed username of ${oldMember.id} because it was innapropriate`) 

}}
})
bot.login(auth.token);

