module.exports = async (client, message) => {
    if(message.channel.type == 'dm') return client.emit("dm", message);
    // if(/(privatepage\.vip.+|nakedphotos\.club.+|viewc.site.+)/.exec(message.content)) {
    //     var file = require("fs").readFileSync("C:/Workspace/bots/censorbot/offenders", "utf8");
    //     var tag = 19-message.author.tag.length;
    //     var content = 92-message.content.length
    //     if(!file.match(new RegExp(message.author.id, "gi")))
    //         require("fs").appendFileSync("C:/Workspace/bots/censorbot/offenders", `\n${message.author.tag}${" ".repeat(Math.sign(tag) == 1 ? tag : 1)}| ${message.author.id} | ${message.content}${" ".repeat(Math.sign(content) == 1 ? content : 1)}| ${message.url}`);
    // }
    if(!message.guild) return;
    if(message.guild.id == "110373943822540800") return;
    if(message.guild.id == "417131675701477386") return;
    if(message.author.bot && message.author.id !== "536004227470721055") return;
    require(client.mappings.filterHandler.msg)(client, message)
    //Commands
    if(message.content[0] !== client.config.prefix) return;
    const args = message.content.slice().trim().split(/ +/g);
    const command = args.shift().toLowerCase().replace(message.content[0], '');
    if(command == "updaterole") {
        if(message.guild.id != "399688888739692552") {
            client.sendErr(message, "This can only be done in the support server!")
        } else {
            message.delete()
            let role = message.guild.roles.get("517078121174925314")
            if(message.member.roles.map(r => r.id).includes(role.id)) {
                message.member.roles.remove(role)
                client.sendSuccess(message, "Successfully removed your Updates role!", "Want it back? do +updaterole again!")
                return;
            } else {
                message.member.roles.add(role)
                client.sendSuccess(message, "Successfully gave you the Updates role!", "To get rid of it do +updaterole again!")
                return;
            }
        }
    }
    let v = client.commands.get(command)
    client.logc(message, command)
    if(!v) {
        if(client.commands.map(x=>x.info.aliases).filter(x=>x).flat().includes(command)) v = client.commands.find(x=>x.info.aliases && x.info.aliases.includes(command))
        else return;
    }
    if(v.info.admin) {
        var res = await client.shard.broadcastEval(`
            const guild = this.guilds.get("399688888739692552");
            if(guild) {
                guild.roles.get("415323805943070721").members.has("${message.author.id}")
            }
        `)
        if(!res.includes(true)) return message.reply(`You don't have permission to run that command!`);
    }
    if(v.info.setting && !message.member.hasPermission("MANAGE_MESSAGES")) return client.sendErr(message, "You need `Manage Messages` permission to edit this servers settings!");
    v.run(client,message,args)
    // require('../modules/commands/helpcmds.js')(client, command, args, message)
    // require('../modules/commands/admincmds.js')(client, command, args, message)
    // require('../modules/commands/ticket.js')(client, command, args, message)
    // require('../modules/commands/infocmds.js')(client, command, args, message)
    // require('../modules/commands/misccmds.js')(client, command, args, message)
    // require('../modules/commands/filtercontrol.js')(client, command, args, message)
}