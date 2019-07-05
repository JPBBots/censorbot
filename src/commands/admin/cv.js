exports.run = async (client,message,args) => {
    message.delete()
    arg1 = args[0]
    arg2 = args[1]
    if(arg1 == "new") {
        let embed = JSON.parse(require('fs').readFileSync('./data/voteembed.json'))
        embed.embed['timestamp'] = new Date()
        message.channel.send("@everyone", embed)
        return;
    }
    if(arg1 == "edit") {
        let embed = JSON.parse(require('fs').readFileSync('./data/voteembed.json'))
        let a = await client.channels.get("489570784918896660").messages.fetch(arg2)
        embed.embed['timestamp'] = a.embeds[0].timestamp
        a.edit("@everyone", embed)
    }
}
exports.info = {
    name: 'cv',
    description: "CreateVote",
    format: "{prefix}cv [new/edit]",
    aliases: ["createvote"]
}