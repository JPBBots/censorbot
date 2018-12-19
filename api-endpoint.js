const Discord = require('discord.js')
const client = new Discord.Client()
client.config = require('./config.js')
client.on('ready', () => {
    require('./modules/webpanel/panel.js')(client)
})
client.on('message', (message) => {
    if(message.author.id !== client.config.ownerID) return;
    if(message.content == "$r") {
        process.exit()
    } 
})
client.login(client.config.token)
