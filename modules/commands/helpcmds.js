module.exports = async (client, command, args, message) => {
    if (command == 'help') {
        message.delete()
        const Discord = require('discord.js')
        let helpstring = ""
        let cmds = Object.keys(client.config.commands) 
        for(i=0; i<cmds.length; i++) {
            let cmddesc = client.config.commands[cmds[i]]
            helpstring = helpstring + `__${client.config.prefix}${cmds[i]}__: ${cmddesc.replace('{name}', client.config.name).replace('{prefix}', client.config.prefix)}\n`
        }
        let helpembed = new Discord.RichEmbed()
        .setDescription(helpstring)
        .setColor('RANDOM')
        .setFooter("This Message Will Self Destruct in 30 Seconds!", client.user.avatarURL)
        .setTitle("Hello and Thank You For Using " + client.config.name + "!")
        const helpmsg = await message.channel.send(helpembed)
        setTimeout(function() {
            helpmsg.edit(":boom:")
            setTimeout(function() {
                helpmsg.delete()
            }, 5000);
        }, 25000);
        console.log(`${message.author} ${message.author.username} Requested Help...`)
        client.c_log(`${message.author} ${message.author.username} Requested Help...`)
    }
    
    if (command == 'faq') {
        message.delete();
        let faq = {
            "embed": {
                "title": "Frequently Asked Questions (FAQ)",
                "url": client.config.website + "",
                "color": 4070736,
                "author": {
                    "name": client.config.name + "",
                    "url": client.config.invitesite + "",
                    "icon_url": client.user.avatarURL + ""
                },
                "fields": [{
                    "name": "What is the help command",
                    "value": client.config.prefix + "help"
                }, {
                    "name": "How to allow cursing in certain channels",
                    "value": "Set the channel to `NSFW`"
                }, {
                    "name": "How to turn on/off the filter",
                    "value": "Use `" + client.config.prefix + "on` and `" + client.config.prefix + "off`"
                }, {
                    "name": "I'm getting an error message about the log channel",
                    "value": "Run +setlog in a desired log channel"
                }, {
                    "name": "I found a word that shouldn't be censored",
                    "value": "Run `+ticket word <word that shouldn't be censored>` and a staff member will get on it as soon as possible"
                }, {
                    "name": "I am banned from using the ticket command",
                    "value": "This was most likely from overuse of the command, if you believe this was a mistake join the [support server](" + client.config.support + ")"
                }, {
                    "name": "Can I add/remove my own words",
                    "value": "If you know an ACTUAL bad word to be censored DM the owner! However if you have a very server specific bad word, use the +filter command!"
                }]
            }
        }
        message.channel.send(faq)
    }
    if (command == 'support') {
        message.delete()
        const msg = await message.reply("Support Server Sent to DM's")
        setTimeout(function() {
            msg.delete()
        }, 6000);
        message.author.send(client.config.support)
        console.log(`${message.author} ${message.author.username} Requested Support...`)
        client.c_log(`${message.author} ${message.author.username} Requested Support...`)
    }
}