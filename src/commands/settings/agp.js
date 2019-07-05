exports.run = async (client, message, args) => {
    let r = (await client.rdb.get(message.guild.id).run()).antighostping
    if(r) {
        var res = await client.sendSettings(message, ["Anti-GhostPing", "ON", "OFF"], ["Successfully toggled Anti-GhostPing OFF","Set by " + message.author.username])
        if(res == 200) {
            client.rdb.get(message.guild.id).update({antighostping: false}).run();
        } else return console.log("Error: " + res);
    } else {
        var res = await client.sendSettings(message, ["Anti-GhostPing", "OFF", "ON"], ["Successfully toggled Anti-GhostPing ON","Set by " + message.author.username])
        if(res == 200) {
            client.rdb.get(message.guild.id).update({antighostping: true}).run();
        } else return console.log("Error: " + res);
    }
}
exports.info = {
    name: "agp",
    description: "Anti-GhostPing, prevent ping messages that get instantly removed for cursing, WhO pInGeD mE?",
    format: "{prefix}agp",
    aliases: ["antighostping"]
}