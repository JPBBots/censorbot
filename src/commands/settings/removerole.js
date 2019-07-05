exports.run = async (client,message,args) => {
    message.delete()
    let v = (await client.rdb.get(message.guild.id).run()).role;
    if(v == "none") {
        client.sendErr(message, "Error! The role hasn't been set, so therefore could not be removed! (Do " + client.config.prefix + "setrole to set one.")
        return;
    }
    var res = await client.sendSettings(message, ["Uncensor Role", message.guild.roles.has(v) ? message.guild.roles.get(v) : "@error", "NONE"], ["Uncensor Role Successfully Removed!", "Uncensor Role Removed by " + message.author.username],[false, true])
    if(res == 200) {    
        client.rdb.get(message.guild.id).update({'role': null}).run();
    } else return console.log("Error: " + res);
}
exports.info = {
    name: 'removerole',
    description: "Remove's the uncensor role ({prefix}setrole)",
    format: "{prefix}removerole"
}