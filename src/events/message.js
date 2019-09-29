const fetch = require("node-fetch");

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
    client.filterHandler.msg(client, message)
    //Commands
    if(!message.content.startsWith(client.config.prefix) && !message.content.startsWith(`<@${client.user.id}>`) && !message.content.startsWith(`<@!${client.user.id}>`)) return;
    var prefix;
    if(message.guild.id == "264445053596991498" && message.content.startsWith(client.config.prefix)) return;
    if(message.content.startsWith(client.config.prefix)) prefix = client.config.prefix
    else if(message.content.startsWith("<@")) {
        if(message.content.startsWith("<@!")) prefix = `<@!${client.user.id}> `;
        else prefix = `<@${client.user.id}> `;
        
        message.mentions.users.delete(client.user.id);
        message.mentions.members.delete(client.user.id)
    }
    
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
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
    if(v.info.admin && !(await client.adminRequest(message.author.id))) return message.reply(`You don't have permission to run that command!`);
    if(v.info.setting && !message.member.hasPermission("MANAGE_MESSAGES") && !(await client.adminRequest(message.author.id))) return client.sendErr(message, "You need `Manage Messages` permission to edit this servers settings!");
    if(v.info.setting && !["settings", "setlog", "punishments"].includes(v.info.name)) return message.reply("These commands are now fully deprecated, please use the NEW `+settings` command!").then(x=>x.delete({timeout: 10000}))
    v.run(client,message,args,message.guild.db());
    // require('../modules/commands/helpcmds.js')(client, command, args, message)
    // require('../modules/commands/admincmds.js')(client, command, args, message)
    // require('../modules/commands/ticket.js')(client, command, args, message)
    // require('../modules/commands/infocmds.js')(client, command, args, message)
    // require('../modules/commands/misccmds.js')(client, command, args, message)
    // require('../modules/commands/filtercontrol.js')(client, command, args, message)
}