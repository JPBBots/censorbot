exports.run = async (client,message,args) => {
    message.delete();
    var aaa = (await client.rdb.get(message.guild.id).run()).msg
    if(aaa === false) return client.sendErr(message, "Message is already off!");
    var res = await client.sendSettings(message, ["Message Reply", aaa ? "Default" : aaa, "OFF"], ['Removed filter message!', 'Filter message removed by ' + message.author.username])
	    if(res==200) return client.rdb.get(message.guild.id).update({msg: false}).run();
	    else return console.log("Error: " + res)
}
exports.info = {
    name: 'delmsg',
    description: "Removes the filter message completely (No reply when someone curses)",
    format: "{prefix}"
}