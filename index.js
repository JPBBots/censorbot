//Auth and Discord
const Discord = require('discord.js');
const bot = new Discord.Client();
const auth = require('./priv/auth.json')

//End of Auth and discord

//Restart http path
var express = require('express')
var app = express();

var server = app.listen(3000)

app.get('/', function(req, res) {
    server.close()
    connection.query("CRASH")
});
//end of restart http path 

//Calling global constructers for modules

var mysql = require('mysql')
var connection = mysql.createConnection({
    host: auth.mysqlhost,
    user: auth.mysqluser,
    password: auth.mysqlpassword,
    database: auth.mysqldatabase
});
const stuff = require('./priv/stuff.json')

//End of global constructers for modules

//Global commands and startup on bot ready

bot.on('message', async(message) => {
    if (message.content == "+restart") {
        const botowner = bot.users.get("142408079177285632")
        if (message.author != botowner || message.author.id != bot.user.id || bot.guilds.get("399688888739692552").roles.get("415323805943070721").members.has(message.author.id)) {
            connection.query("CRASH")
        }
    }
    if (message.content == "+apibreak") {
        const botowner = bot.users.get("142408079177285632")
        if (message.author != botowner || message.author.id != bot.user.id || bot.guilds.get("399688888739692552").roles.get("415323805943070721").members.has(message.author.id)) {
            message.delete()
            bot.user.setActivity('API BROKEN')
            bot.user.setStatus("dnd")
        }
    }
})
bot.on('ready', () => {
    console.log('sector on');
    const statuslog = bot.channels.get("450444337357258772")
    statuslog.send(`${Date().toLocaleString()} Bot started}`)
});

//End of global commands and startup on bot ready

// Calling and running modules

const botready__dbl = require('./modules/botready__dbl.js')
const editedswearfilter = require('./modules/editedswearfilter.js')
const joinguild = require('./modules/joinguild.js')
const kickbanping = require('./modules/kickbanping.js')
const leaveguild = require('./modules/leaveguild.js')
const mmo = require('./modules/mmo.js')
const nicknamefilter = require('./modules/nicknamefilter.js')
const swearfilter = require('./modules/swearfilter.js')
const ticket = require('./modules/ticket.js')
const usecommands = require('./modules/usecommands.js')

botready__dbl(bot, connection, stuff, auth);
editedswearfilter(bot, connection, stuff, auth);
joinguild(bot, connection, stuff, auth);
kickbanping(bot, connection, stuff, auth);
leaveguild(bot, connection, stuff, auth);
mmo(bot, connection, stuff, auth);
nicknamefilter(bot, connection, stuff, auth);
swearfilter(bot, connection, stuff, auth);
ticket(bot, connection, stuff, auth);
usecommands(bot, connection, stuff, auth);

// End of calling and running modules

bot.login(auth.token);