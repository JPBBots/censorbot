exports.run = async (client,message,args,db) => {
    message.delete()
    let arg1 = args[0]
    if(message.channel.name == "general" && arg1 != "--") {
        var embed = client.u.embed
            .setTitle("Warning")
            .setColor("RED")
            .setDescription("We do not suggest setting your log channel to the general chat, the log channel will be filled with ALL the curses the bot deletes, we recommend setting this to a seperate channel that is privacy or out of the way. Having everything log in the general chat defeats the purppose of the bot.")
            .setFooter("If you're absolute bent on setting general to the log channel add a -- to the end of your command.");
        return message.channel.send(embed).then(client.u.del(7000));
    }
    let dba = await db.getAll();
    if(!dba) {
        var config = new client.config.serverConfig(message.guild.id);
        await client.rdb.insert(config).run();
        dba = config;
    }
    var curChan = dba.log
    if(curChan == message.channel.id) return client.sendErr(message, "This is already the set log channel!")
    var wwMsg = await message.reply("Setting the log channel takes a little bit of time, please wait!");
    await db.set("log", message.channel.id);
    var res = await client.sendSettings(message, ["Log Channel", curChan != "none" && client.channels.has(curChan) ? client.channels.get(curChan) : "`none`", message.channel], ["Successfully Set Log Channel to The Current Channel!", "Log Channel Set By " + message.author.username],[false, false],true)
    if(curChan && curChan != 'none') client.channels.get(curChan).send(res);
    wwMsg.delete();
}
exports.info = {
    name: 'setlog',
    description: "Set's the log channel for the server",
    format: "{prefix}setlog #channel"
}