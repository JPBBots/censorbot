module.exports = async (client, command, args, message) => {
    const fs = require('fs')
    if(command == "ticket") {
        let bannedusers = JSON.parse(fs.readFileSync('./modules/commands/assets/bannedusers.json'))
        if(bannedusers.banned_users.contains(message.author.id)) {
            let banno = await message.reply("Hello! We are sorry to inform you but you have been banned from using this feature! This was most likely caused by you abusing the command, if you would like to appeal or find out exactly why you were banned feel free to do " + client.config.prefix + "support and talk to the owner, Sorry! -" + client.config.name + " Support Team")
            setTimeout(() => {
                banno.delete()
            }, 20000);
            return;
        }
        if (!message.guild) {
            var sent = "DMs"
        }
        if (message.guild) {
            var sent = `Server: ${message.guild.name} ${message.guild.id}`
        }
        let arg1 = args[0]
        let Discord = require('discord.js')
        if(!arg1) {
            let tickethelpembed = new Discord.RichEmbed()
            .setDescription('Tickets are to request that a word be uncensored from the prebuilt filter!\n\nCreate a ticket: ' + client.config.prefix + 'ticket `Word`')
            .setColor('RANDOM')
            .setFooter("This Message Will Self Destruct in 10 Seconds! (Requested by " + message.author.username + ")", client.user.avatarURL)
            .setTitle("Ticket System")
            let res = await message.channel.send(tickethelpembed)
            setTimeout(function() {
                res.delete()
            }, 10000)
            return;
        }
        if(message.content.match(/"/)) {
            client.sendErr(message, "Please don't include \" in your ticket!")
            return;
        }
        let filter = require('../filter/filter.js')
        let iscensor = filter(client, client.RemoveAccents(message.content).slice().trim().split(/ +/g), message.guild)
        if(iscensor == false) {
            let notcensorres = await message.reply("Ticket stopped! The automatic detection system found you tried to submit a ticket of a word that isn't censored! If this isn't true then please join the support server (" + client.config.prefix + "support)!")
            setTimeout(function() {
                notcensorres.delete()
            }, 10000)
        } else {
            if(iscensor[2] == "server") {
                let servercensored = await message.reply("Ticket stopped! We found that this word isn't censored by our filter but is censored by your servers custom filter! Do +filter for more information or contact an admin of THIS server.")
                setTimeout(function() {
                    servercensored.delete()
                }, 10000)
            } else {
                function createid() {
                    var text = "";
                    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
                  
                    for (var i = 0; i < 3; i++)
                      text += possible.charAt(Math.floor(Math.random() * possible.length));
                   
                   return text;
                }
                let ticid = createid()
                let ticmsg = await client.c_ticket(`TICKETID = ${ticid} : Word ticket > ${message.author} via ${sent}: ${message.content}`)
                fs.writeFile('./data/tickets/' + ticid + '.json', `{"author": "${message.author.id}", "word": "${message.content.split(client.config.prefix +'ticket ')[1]}", "ticmsg": "${ticmsg.id}"}`, (error) => {
                    if(error) {
                    message.reply("Error Occured Writing Ticket File: " + error)
                    return;
                    }
                })
                console.log("Ticket was sent!")
                let ticconfirm = new Discord.RichEmbed()
                .setTitle("Ticket Submitted!")
                .setColor("RANDOM")
                .setDescription("We'll reach out to you soon telling you how it goes!")
                .setFooter("Ticket sent by " + message.author.username + "!")
                let ticcsend = await message.channel.send(ticconfirm)
                setTimeout(() => {
                    ticcsend.delete()
                }, 10000);   
            }
        }
    }
    if (command == "tr") {
        if (client.config.admins.contains(message.author.id)) {
            message.delete()
            let arg1 = args[0]
            let arg2 = args[1]
            if (!arg1) return;
            if (!arg2) return;
            
            if (arg1 == "ntyes") {
                arg3 = args[2]
                let wordgo = arg3
                let ticketsender = client.users.get(arg2)
                try {
                ticketsender.send(`Hey! We noticed that you have said a word/phrase that was censored. This word was "${wordgo}"... You did not submit a ticket but we noticed it on our own! This word is no longer censored, sorry for the inconvenience -${client.config.name} Support Team (Word Patched by ${message.author.username})`)
                console.log("NTAccept")
                }
                catch(err) {
                    let msg = await message.reply("Error, user has DMs disabled or is no longer in a server containing the bot!")
                    setTimeout(function() {
                        msg.edit(":boom:")
                        setTimeout(function() {
                            msg.delete()
                        }, 500)
                    }, 5000);
                }
                return;
            }
            arg2 = arg2.split(',')
            arg2.forEach(async arg2 => {
            let ticketid = arg2
            let ticketfile = JSON.parse(fs.readFileSync('./data/tickets/' + ticketid + '.json'))
            let ticketsender = client.users.get(ticketfile.author)
            let wordgo = ticketfile.word
            if (arg1 == "yes") {
                try {
                ticketsender.send(`Hey! Thank you for your ticket on the word "${wordgo}"! After evaluation with the team we have come to the conclusion of the word no longer being censored! Thank you for reporting and thanks again for using ${client.config.name}! -${client.config.name} Support Team (Ticket Accepted By ${message.author.username})`)
                console.log("Accept")
                }
                catch(err) {
                    let msg = await message.reply("Error, user has DMs disabled or is no longer in a server containing the bot!")
                    setTimeout(function() {
                        msg.edit(":boom:")
                        setTimeout(function() {
                            msg.delete()
                        }, 500)
                    }, 5000);
                }
            }
            if (arg1 == "no") {
                try {
                ticketsender.send(`Hey! After careful evaluation with the team your ticket on the word "${wordgo}" was denied! Sorry, If you believe this was a mistake be sure to join the support server (${client.config.prefix}support) and message the person who denied your ticket (listed at the end of this response). -${client.config.name} Support Team (Ticket Denied By ${message.author.username})`)
                console.log("Deny")
                }
                catch(err) {
                    let msg = await message.reply("Error, user has DMs disabled or is no longer in a server containing the bot!")
                    setTimeout(function() {
                        msg.edit(":boom:")
                        setTimeout(function() {
                            msg.delete()
                        }, 500)
                    }, 5000);
                }
            }
            if (arg1 == "notcensor") {
                try {
                ticketsender.send(`Hey! After careful evaluation with the team your ticket on the word "${wordgo}" was denied because it was not censored! Chances are you either typed the word wrong and set it off or ${client.config.name} was dealing with some difficulties, sorry! -${client.config.name} Support Team (Denied by ${message.author.username})`)
                console.log("CDeny")
                }
                catch(err) {
                    let msg = await message.reply("Error, user has DMs disabled or is no longer in a server containing the bot!")
                    setTimeout(function() {
                        msg.edit(":boom:")
                        setTimeout(function() {
                            msg.delete()
                        }, 500)
                    }, 5000);
                }
            }
            const ticmsg = await client.channels.get("509886529729200128").fetchMessage(ticketfile['ticmsg'])
            ticmsg.delete()
            fs.unlinkSync('./data/tickets/' + ticketid + '.json')
            client.c_ticketlog(`(${ticketid}) ${message.author} responded \`${arg1}\` to (${ticketsender})${ticketsender.username}'s ticket of the word; ${wordgo}`)
        })
        }
    }
    if (command == "ticketban") {
        if (client.MisAdmin(message)) {
            message.delete()
            let arg1 = args[0]
            let arg2 = args[1]
            let bannedusers = JSON.parse(fs.readFileSync('./modules/commands/assets/bannedusers.json'))
            let reason = ""
            if(arg2) {
                reason = " for \"" + arg2 + "\""
            }
            try {
            client.users.get(arg1).send("Hey! You have been banned from the ticket feature by " + message.author.username + reason)
            } catch(err) {
                client.sendErr(message, "User could not be DM'd (still banned)")
            }
            client.c_ticketbanned(`${message.author} banned user (${client.users.get(arg1)})${client.users.get(arg1).username} from the ticket command for ${arg2}`)
            bannedusers.banned_users.push(arg1)
            fs.writeFile('./modules/commands/assets/bannedusers.json', JSON.stringify(bannedusers), async (error) => {
                if(error) {
                    let o = await message.reply("Error: " + error)
                    setTimeout(() => {
                        o.delete()
                    }, 500);
                }
            })
        }
    }
    if (command == "ticketunban") {
        if (client.config.admins.contains(message.author.id)) {
            message.delete()
            let arg1 = args[0]
            let bannedusers = JSON.parse(fs.readFileSync('./modules/commands/assets/bannedusers.json'))
            try {
                client.users.get(arg1).send(`Hey! You have been unbanned from the ticket feature by ${message.author.username}`)
            } catch(err) {
                client.sendErr(message, "User could not be DM'd (still unbanned)")
            }
            client.c_ticketbanned(`${message.author} unbanned user (${client.users.get(arg1)})${client.users.get(arg1).username} from the ticket command.`)
            bannedusers.banned_users = bannedusers.banned_users.filter(e => e !== arg1)
            fs.writeFile('./modules/commands/assets/bannedusers.json', JSON.stringify(bannedusers), async (error) => {
                if(error) {
                    let o = await message.reply("Error: " + error)
                    setTimeout(() => {
                        o.delete()
                    }, 500);
                }
            })
        }
    }
}