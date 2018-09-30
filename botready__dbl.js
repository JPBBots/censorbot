module.exports = function(bot, connection, stuff, auth) {


    const logchannel = bot.channels.get("399688995283533824");
    const serverlistchannel = bot.channels.get("413831069117186078");
    const DBL = require("dblapi.js");
    const dbl = new DBL(auth.dbltoken);
    const modulename = "botready";

    bot.on('ready', () => {
        setInterval(() => {

            dbl.postStats(bot.guilds.size);
            bot.user.setActivity(`For Bad Words | ${bot.guilds.size} servers`, {
                type: 'WATCHING'
            });
            console.log(`Updated ${bot.guilds.size}`);
        }, 1800000);
    });



    bot.on("ready", () => {
        const logchannel = bot.channels.get("399688995283533824");
        console.log('Bot Started...' + bot.guilds.size);
        bot.user.setStatus("online");
        bot.user.setActivity(`For Bad Words | ${bot.guilds.size} servers`, {
            type: 'WATCHING'
        });
        logchannel.send("Bot Either Crashed Or Was Restarted... BOT ONLINE");
    });


};