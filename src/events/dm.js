module.exports = async (client, message) => {
    var user
    if(message.author.id == message.channel.recipient.id) {
        user = client.user
    } else {
        user = message.channel
    }
    if (message.channel.recipient.id == "142408079177285632") return;
    client.msg("DMs", `At ${message.createdAt} ${message.author} DM'd ${user}: ${message.content}`)
}