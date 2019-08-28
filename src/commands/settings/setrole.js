exports.run = async (client,message,args,db) => {
    message.delete()
    let arg1 = args[0]
    if (!arg1) {
        client.sendErr(message, "Missing argument | Format: " + client.config.prefix + "setrole @role")
        return;
    }
    if (!arg1.match(/<@&/)) {
        client.sendErr(message, "Please @ the role you want to uncensor")
        return;
    }
    let roleoof = arg1.split('&')[1].split('>')[0]
    if (!message.guild.roles.get(roleoof)) {
        client.sendErr(message, "Error: Invalid role")
        return;
    }
    var oldRole = await db.get("role");
    if(oldRole == roleoof) return client.sendErr(message, "This is already the selected role!");
    var res = await client.sendSettings(message, ["Uncensor Role", oldRole == null ? "`NONE`" : (message.guild.roles.has(oldRole) ? message.guild.roles.get(oldRole) : "`NONE`"), message.guild.roles.get(roleoof)],["Role added as uncensored role, you can remove this at any time with ` " + client.config.prefix + "removerole`", "Role set by " + message.author.username],[false,false])
    if(res==200) {
       db.set("role", roleoof);
    } else return console.log("Error: " + res);
}
exports.info = {
    name: 'setrole',
    description: "Sets a role that the bot doesn't censor (Only supports one role)",
    format: "{prefix}setrole @role"
}