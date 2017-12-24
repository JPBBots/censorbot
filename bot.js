const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on("ready", () => {
console.log('Bot Started...');
bot.user.setStatus("Idle");
bot.user.setGame('In Development!');
});

bot.on('message', (message) => {
if (message.content == '+ping') {
  message.reply('Pong!')
}
if (message.content == '...') {
  message.reply('Succ')
}
if (message.content == 'hi') {
  message.reply('<@285210257095917569>')
}
if (message.content == '+ding') {
  message.reply('Dong!')
}
if (message.content == 'hipton') {
  message.reply('is thuh best')
}
if (message.content == '+allstar') {
   message.reply('Once again')
}
if (message.content == 'woah') {
   message.reply('AAaAaaaaAa')
}
if(message.content == '+help') {
    message.reply('No help fo u')
}
})
bot.on('message', message => {

var sender = message.author;
var msg = message.content.toUpperCase();
var prefix = '+'


if (message.content == '+test')  {
message.delete()
  .then(msg => console.log(`Deleted message from ${msg.author}`))
message.reply(`Deleted message`)
  .catch(console.error);
		}
		});

		

bot.login('proccess.env.BOT_TOKEN');
