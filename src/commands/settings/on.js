exports.run = async (client,message,args) => {
    message.delete()
    let logc = await client.q_log(message.guild)
    if(!logc) {
        client.sendErr(message, "Error, please set a log channel before toggling the filter! (" + client.config.prefix + "setlog)")
        return;
    }
    let k = (await client.rdb.get(message.guild.id).run()).censor;
    if(k == 1) {
        client.sendErr(message, "Error! The filter is already on!")
        return;
    }
    var res = await client.sendSettings(message, ["Filter Toggle", "OFF", "ON"],["Successfully toggled the filter on!", "Filter Toggled by " + message.author.username])
        if(res == 200) {
            client.rdb.get(message.guild.id).update({'censor':true})
                console.log(`Shard ${client.shard.id} | Turned On Filter for ${message.guild.name}`.grey)
        } else return console.log("Error: " + res);
}
exports.info = {
    name: 'on',
    description: "Turns on the base filter",
    format: "{prefix}on"
}