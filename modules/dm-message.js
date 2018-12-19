module.exports = async (client, message) => {
    if(message.guild) return;
    var user
    if(message.author.id == message.channel.recipient.id) {
        user = client.user
    } else {
        user = message.channel
    }
    if (message.channel.recipient.id == "smthn") return;
    client.channels.get("449658955073978389").send(`At ${message.createdAt} ${message.author} DM'd ${user}: ${message.content}`)
}
