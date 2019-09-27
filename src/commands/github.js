exports.run = async (client,message,args) => {
    message.delete()
    const msg = await message.reply("Github REPO Sent to DM's")
    setTimeout(function() {
        msg.delete()
    }, 6000);
    message.author.send(client.config.github)
}
exports.info = {
    name: 'github',
    description: "Displays the github link",
    format: "{prefix}github"
}