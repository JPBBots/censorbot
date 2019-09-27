module.exports = async (client, message) => {
    var user
    if(message.author.id == message.channel.recipient.id) {
        user = client.user
    } else {
        user = message.channel
    }
    if (message.channel.recipient.id == "142408079177285632") return;
    client.webhooks.dms.send(
        client.u.embed
            .setTitle("DM")
            .setDescription(message.content)
            .addField("From", `${message.author} ${message.author.tag}`, true)
            .addField("To", `${user} ${user.tag}`, true)
            .setTimestamp(message.createdAt)
    );
}