module.exports = async (client, command, args, message) => { 
    function inviteme(msg) {
        msg.delete()
        msg.reply('`Invite me:` ' + client.config.invitesite)
        console.log(`${msg.author} ${msg.author.username} Requested an Invite...`)
        client.c_log(`${msg.author} ${msg.author.username} Requested an Invite...`)
    }
    if(command == "inv" || command == "invite") inviteme(message)
    if(command == "github") {
        message.delete()
        const msg = await message.reply("Github REPO Sent to DM's")
        setTimeout(function() {
            msg.delete()
        }, 6000);
        message.author.send(client.config.github)
        console.log(`${message.author} ${message.author.username} Requested GitHub...`)
        client.c_log(`${message.author} ${message.author.username} Requested GitHub...`)
    }
    if(command == "vote") {
        message.delete()
            const votemsg = await message.reply(`You can vote for ${client.config.name} by going to https://discordbots.org/bot/394019914157129728/vote It really does help if you do!!`)
            setTimeout(function() {
                votemsg.edit(":boom:")
                setTimeout(function() {
                    votemsg.delete()
                }, 1000)
            }, 10000);
    }
    if(command == "donate") {
        message.delete()
        message.reply('Donate (All goes towards development of new features/new products!): ' + client.config.donate)
        console.log(`${message.author} ${message.author.username} Requested Donation...`)
        client.c_log(`${message.author} ${message.author.username} Requested Donation...`)
    }
    if(command == "cv") {
        if(!client.MisAdmin(message)) return;
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
            let a = await client.channels.get("489570784918896660").fetchMessage(arg2)
            embed.embed['timestamp'] = a.embeds[0].timestamp
            a.edit("@everyone", embed)
        }
    }
}