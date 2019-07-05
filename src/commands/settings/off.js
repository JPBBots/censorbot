exports.run = async (client,message,args) => {
    message.delete()
    let logc = await client.q_log(message.guild)
    if(!logc) {
        client.sendErr(message, "Error, please set a log channel before toggling the filter! (" + client.config.prefix + "setlog)")
        return;
    }
    let k = (await client.rdb.get(message.guild.id).run()).censor;
    if(k == 0) {
        client.sendErr(message, "Error! The filter is already off!")
        return;
    }
    var res = await client.sendSettings(message, ["Filter Toggle", "ON", "OFF"],["Successfully toggled the filter off!", "Filter Toggled by " + message.author.username])
        if(res == 200) {
            let r = client.rdb.get(message.guild.id).update({'censor': false}).run();
                console.log(`Shard ${client.shard.id} | Turned Off Filter for ${message.guild.name}`.grey)
        } else return console.log("Error: " + res);
}
exports.info = {
    name: 'off',
    description: "Turns off the base filter",
    format: "{prefix}off"
}