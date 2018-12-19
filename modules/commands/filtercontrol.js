module.exports = async (client, command, args, message) => {
    let Discord = require('discord.js')
    let fs = require('fs')     
    if(command == "filter") {
        let arg1 = args[0]
        let arg2 = args[1]
        let arg3 = args[2]
        let arg4 = args[3]
        let arg5 = args[4]
        if(!arg1) {
            let o = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setTitle("Filter Command:")
            .setDescription("+filter `add` : Add a custom word!\n+filter `remove` : Remove a custom word!\n+filter `clear` : Clears entire filter! (No warning, be careful)\n+filter `list` : List custom words for the server!\n+filter `backup` : For creating, importing and managing ticket backups!")
            .setFooter("The filter command is used to add, remove, and see custom censor words to be added to the server!\nThis only affect your server! No one elses and cannot change the hard locked filter!")
            message.channel.send(o)
        }
        let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + '.json'))
        if(arg1 == "add") {
            if(!message.member.hasPermission('MANAGE_MESSAGES')) {
                client.sendErr(message, "Error! Only users with Manage Messages permission can do that!")
                return;
            }
            if(!arg2) {
                message.reply("Add a word to the filter! Format: +filter add `word`")
            } else {
                let filter = require('../filter/filter.js')
                let iscensor = await filter(client, client.RemoveAccents(message.content).slice().trim().split(/ +/g), message.guild)
                if(iscensor == true || iscensor[2] == "base") {
                    client.sendErr(message, "Error, this word is already contained in the base filter! There is no need to add it!")
                    return;
                }
                if(message.content.match(/("|\*|\.|'|\||\\|\/|`)/gi)) {
                    client.sendErr(message, "Error! Please Do Not Include Any Of these Characters: \", *, ., ', \\, /, `, |")
                    return;
                } else {
                if(serverdata['filter'].contains(message.content.split(client.config.prefix + 'filter add ')[1])) {
                    client.sendErr(message, "Error! This word is already in this servers filter! If it still isn't censoring contact support (" + client.config.prefix + "support)")
                    return;
                } else {
                serverdata['filter'].push(message.content.split(client.config.prefix + 'filter add ')[1])
                fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
                    if(error) {
                        message.reply("Error occured while writing this file: " + error)
                    } else {
                        client.sendSuccess(message, "Successfully added the word! Do +filter list to see your filter!", "Filter edited by " + message.author.username)
                        return;
                    }
                })
                }
        }
    }
        }
        if(arg1 == "remove") {
            if(!message.member.hasPermission('MANAGE_MESSAGES')) {
                client.sendErr(message, "Error! Only users with Manage Messages permission can do that!")
                return;
            }
            if(!arg2) {
                message.reply("Remove a word from the filter! Format: +filter remove `word`")
            } else {
                if(!serverdata['filter'].contains(message.content.split(client.config.prefix + 'filter remove ')[1])) {
                    client.sendErr(message, "Error! This word is not on this server's custom filter! So therefore could not be removed.")
                    return;
                } else {
                serverdata['filter'] = serverdata['filter'].filter(e => e !== message.content.split(client.config.prefix + 'filter remove ')[1])
                fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
                    if(error) {
                        message.reply("Error occured while writing this file: " + error)
                    } else {
                    client.sendSuccess(message, "Successfully removed the word! Do +filter list to see your filter!", "Filter edited by " + message.author.username)
                    return;
                    }
                })
            }
        }
    }
        if(arg1 == "clear") {
            if(!message.member.hasPermission('MANAGE_MESSAGES')) {
                client.sendErr(message, "Error! Only users with Manage Messages permission can do that!")
                return;
            } else {
                if(!serverdata['filter'][0]) {
                    client.sendErr(message, "Error! There are no words in the filter to be cleared")
                    return;
                } else {
                serverdata['filter'] = []
                fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
                    if(error) {
                        message.reply("Error occured while writing this file: " + error)
                    } else {
                        client.sendSuccess(message, "Successfully removed all words from the filter!", "Filter edited by " + message.author.username)
                        return;
                    }
                })
            }
        }
        }
        
        if(arg1 == "list") {
            if(!serverdata['filter'][0]) {
                client.sendErr(message, "Error! there are no words added to the filter!")
                return;
            } else {
                let o = new Discord.RichEmbed()
                .setColor("DARK_GOLD")
                .setTitle("Current Filter:")
                .setDescription(serverdata['filter'].makeReadable())
                .setFooter("List Requested By: " + message.author.username + " (Want message that doesn't self destruct? Do +filter list --)")
                if(!message.content.match(/--/)) {
                    let me = await message.channel.send(o)
                    setTimeout(() => {
                        me.delete()
                    }, 6000);
                } else {
                    message.channel.send(o)
                }  
            }
        
        }
        if(arg1 == "backup") {
            if(message.author.id != message.guild.owner.id) {
                client.sendErr(message, "Only the owner can run this command!")
                return;
            }
            if(!arg2) {
                let o = new Discord.RichEmbed()
                .setColor("RANDOM")
                .setTitle("Filter Backup Command:")
                .setDescription("+filter backup `create` : Create a backup of the filter!\n+filter backup `delete` : Remove the filter backup file!\n+filter backup `import` : Import's backed up filter\n+filter backup `password` : Password settings for this servers filter backup\n+filter backup `info` : Send DM of info about server's backed up filter (Includes password)")
                .setFooter("Run any of these commands to see the full help menu for each!")
                message.channel.send(o)
            }
            if(arg2 == "create") {
                if(!JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + ".json"))['filter'][0]) {
                    client.sendErr(message, "There are no filter contents for this server!")
                    return;
                }
                if(!arg3) {
                    let o = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .setTitle("Filter Create Command:")
                    .setDescription("Propper usage: +filter backup create --confirm")
                    message.channel.send(o)
                    return;
                }
                if(arg3 != "--confirm") {
                    client.sendErr(message, "Please add --confirm to confirm the creation of this back (+filter backup create --confirm)")
                    return;
                }
                let filt = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + '.json'))['filter']
                let pass = ""
                if(fs.existsSync('./data/filter_backups/' + message.guild.id + '.json')) {
                    pass = JSON.parse(fs.readFileSync('./data/filter_backups/' + message.guild.id + '.json'))['password']
                } else {
                    pass = "none"
                }
                let o = {}
                o['password'] = pass
                o['filter'] = filt
                fs.writeFile('./data/filter_backups/' + message.guild.id + '.json', JSON.stringify(o), (error) => {
                    if(error) {
                        client.sendErr(message, "Random error occured: " + error)
                        return;
                    } else {
                        client.sendSuccess(message, "Backed up the filter! (Filter contents = " + filt.makeReadable() + ") Set a password for the filter with +filter password (Optional)", "Filter backed up by " + message.author.username)
                    }
                }) 
            }
            if(arg2 == "delete") {
                if(!arg3) {
                    let o = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .setTitle("Filter Create Command:")
                    .setDescription("Propper usage: +filter backup delete `password`")
                    .setFooter("(If there is no password replace it with \"none\" (+filter backup delete none))")
                    message.channel.send(o)
                    return;
                }
                if(!fs.existsSync('./data/filter_backups/' + message.guild.id + '.json')) {
                    client.sendErr(message, "Error! There is no filter backup on this server!")
                    return;
                }
                let filtdata = JSON.parse(fs.readFileSync('./data/filter_backups/' + message.guild.id + '.json'))
                let pass = false
                if(filtdata['password'] != "none") {
                    if(filtdata['password'] === arg3) {
                        pass = true
                    } else {
                        pass = false
                    }
                } else {
                    pass = true
                }
                if(!pass) {
                    client.sendErr(message, "Incorrect filter password!")
                    return;
                }
                fs.unlinkSync('./data/filter_backups/' + message.guild.id + '.json')
                client.sendSuccess(message, "Successfully removed filter backup!", "Filter Deleted by " + message.author.username)
            }
            if(arg2 == "import") {
                if(!arg3) {
                    let o = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .setTitle("Filter Create Command:")
                    .setDescription("Propper usage: +filter backup import `filterid` `password`")
                    .setFooter("(If there is no password don't worry about entering \"password\")")
                    message.channel.send(o)
                    return;
                }
                if(!fs.existsSync('./data/filter_backups/' + arg3 + '.json')) {
                    client.sendErr(message, "Error! There is no filter by that ID!")
                    return;
                }
                let filtdata = JSON.parse(fs.readFileSync('./data/filter_backups/' + arg3 + '.json'))
                let pass = false
                if(filtdata['password'] != "none") {
                    if(!arg4) {
                        client.sendErr(message, "This filter required please add a password! +filter backup import " + arg3 + " `password`")
                        pass = false
                    } else {
                        if(filtdata['password'] === arg4) {
                            pass = true
                        } else {
                            client.sendErr(message, "Incorrect password!")
                        }
                    }
                } else {
                    pass = true
                }
                if(!pass) return;
                let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + ".json"))
                serverdata['filter'] = filtdata['filter']
                fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), (error) => {
                    if(error) {
                        client.sendErr(message, "Unexpected error: " + error)
                        return;
                    } else {
                        client.sendSuccess(message, 'Filter update with imported filter `' + arg3 + '`! (Contents = ' + filtdata['filter'].makeReadable() + ")", "Filter imported by " + message.author.username)
                        return;
                    }
                })
            }
            if(arg2 == "password") {
                if(!fs.existsSync('./data/filter_backups/' + message.guild.id + ".json")) {
                    client.sendErr(message, "Error! There is no filter backup made for this server! Do `+filter backup create` to make one!")
                    return;
                }
                let filt = JSON.parse(fs.readFileSync('./data/filter_backups/' + message.guild.id + ".json"))
                if(!arg3) {
                    let o = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .setTitle("Filter Password Command:")
                    .setDescription("+filter backup password `set` : Set's a password for the filter backup!\n+filter backup password `remove` : Remove the password from the filter backup file!")
                    .setFooter("(If there is no password no password is required to change the file.)")
                    message.channel.send(o)
                    return;
                }
                if(arg3 == "set") {
                    if(!arg4 || !arg5 && !filt['password'] == "none") {
                        client.sendErr(message, 'Propper usage: +filter backup password set `newpassword` `oldpassword`(possible)')
                        return;
                    }
                    let pass = false
                    if(filt['password'] != "none") {
                        if(filt['password'] === arg5) {
                            pass = true
                        } else {
                            pass = false
                            client.sendErr(message, "Incorrect Old Password!")
                        }
                    } else {
                        pass = true
                    }
                    if(!pass) return;
                    filt['password'] = arg4
                    fs.writeFile('./data/filter_backups/' + message.guild.id + '.json', JSON.stringify(filt), (error) => {
                        if(error) {
                            client.sendErr(message, "Unexpected error: " + error)
                        } else {
                            message.author.send('New filter password: ' + filt['password'])
                            client.sendSuccess(message, 'New password set for filter backup', 'New password sent to ' + message.author.username + ' in DMs for storage purposes, don\'t forget it!')
                            return;
                        }
                    })
                } else {
                    if(arg3 == "remove") {
                        if(filt['password'] == "none") {
                            client.sendErr(message, "There's no filter password, no need to remove nothing!")
                            return;
                        }
                        if(!arg4) {
                            client.sendErr(message, "Propper usage: +filter backup password remove `oldpassword`")
                            return;
                        }
                        if(!filt['password'] === arg4) {
                            client.sendErr(message, "Incorrect password!")
                            return;
                        }
                        filt['password'] = "none"
                        fs.writeFile('./data/filter_backups/' + message.guild.id + '.json', JSON.stringify(filt), (error) => {
                            if(error) {
                                client.sendErr(message, "Unexpected error: " + error)
                            } else {
                                client.sendSuccess(message, 'Password has been reset', "When someone imports your filter they will not need to enter a password!")
                                return;
                            }
                        })
                    } else {
                        client.sendErr(message, 'Unexpected option: ' + arg3)
                        return;
                    }
                }   
            }
            if(arg2 == "info") {
                if(!fs.existsSync('./data/filter_backups/' + message.guild.id + ".json")) {
                    client.sendErr(message, "Error! There is no filter backup made for this server! Do `+filter backup create` to make one!")
                    return;
                }
                let filt = JSON.parse(fs.readFileSync('./data/filter_backups/' + message.guild.id + ".json"))
                let pass = false
                if(filt['password'] != "none") {
                    if(!arg3) {
                        pass = false
                        client.sendErr(message, "This filter requires a password, please enter one! (+filter backup info `password`")
                        return;
                    }
                    if(filt['password'] === arg3) {
                        pass = true
                    } else {
                        client.sendErr(message, "Incorrect password!")
                    }
                } else {
                    pass = true
                }
                if(!pass) return;
                let o = new Discord.RichEmbed()
                .setTitle('Filter Backup Info:')
                .setColor('RANDOM')
                .setDescription('Password: `' + filt['password'] + '` Content: ' + filt['filter'].makeReadable())
                message.author.send(o)
                return;
            }
        }
    }
    if(command == "setlog") {
        message.delete()
        let arg1 = args[0]
        if (message.author.id !== message.guild.owner.id) {
            client.sendErr(message, "Error! Only the owner can do this!")
            return;
        }
        let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + '.json'))
        serverdata['log'] = message.channel.id
        fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
            if(error) {
                message.reply("Error occured: " + error)
            } else {
                let o = new Discord.RichEmbed()
                .setColor("DARK_GREEN")
                .setTitle("Successfully Set Log Channel to The Current Channel!")
                .setFooter("Log Channel Set By " + message.author.username)
                let me = await message.channel.send(o)
                setTimeout(() => {
                    me.delete()
                }, 4000);
                return;
            }
        })
    }
    if(command == "setrole") {
        message.delete()
        if (message.author.id !== message.guild.owner.id) {
            client.sendErr(message, "Error! You aren't allowed to use this command! Contact the owner of the server to use this command")
            return;
        }
        let arg1 = args[0]
        if (!arg1) {
            client.sendErr(message, "Missing argument | Format: " + client.config.prefix + "setrole @role")
            return;
        }
        if (!arg1.match(/<@&/)) {
            client.sendErr(message, "Please @ the role you want to uncensor")
            return;
        }
        let roleoof = arg1.split('&')[1].split('>')[0]
        if (!message.guild.roles.get(roleoof)) {
            client.sendErr(message, "Error: Invalid role")
            return;
        }
        let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + '.json'))
        serverdata['role'] = roleoof
        fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
            if(error) {
                message.reply("Error Occured: " + error)
            } else {
                client.sendSuccess(message, "Role added as uncensored role, you can remove this at any time with ` " + client.config.prefix + "removerole`", "Role set by " + message.author.username)
                return;
            }
        })
    }
    if(command == "removerole") {
        message.delete()
        if (message.author.id !== message.guild.owner.id) {
            client.sendErr(message, "Error! You aren't allowed to use this command! Contact the owner of the server to use this command")
            return;
        }
        let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + '.json'))
        if(serverdata['role'] == "none") {
            client.sendErr(message, "Error! The role hasn't been set, so therefore could not be removed! (Do " + client.config.prefix + "setrole to set one.")
            return;
        }
        serverdata['role'] = "none"
        fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
            if(error) {
                message.reply("Error Occured: " + error)
            } else {
                client.sendSuccess(message, "Uncensor Role Successfully Removed!", "Uncensor Role Removed by " + message.author.username)
                return;
            }
        })
    }
    if (command ==  'on') {
        message.delete()
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            client.sendErr(message, "You can't do that! Contact your server owner/admin to toggle the chat filter!")
            return;
        }
        let logc = client.q_log(message.guild)
        if(!logc) {
            client.sendErr(message, "Error, please set a log channel before toggling the filter! (" + client.config.prefix + "setlog)")
            return;
        }
        let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + '.json'))
        if(serverdata['censor'] == 1) {
            client.sendErr(message, "Error! The filter is already on!")
            return;
        }
        serverdata['censor'] = 1
        fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
            if (error) {
                message.reply("Error occured: " + error)
            } else {
            client.channels.get(logc).send(`${message.author} Toggled The Filter On`)
            message.guild.owner.send(`${message.author} Toggled The Filter On`)
            console.log(`Turned On Filter for ${message.guild.name}`)
            client.sendSuccess(message, "Successfully toggled the filter on!", "Filter Toggled by " + message.author.username)
            }
        })
    }
    if (command ==  'off') {
        message.delete()
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            client.sendErr(message, "You can't do that! Contact your server owner/admin to toggle the chat filter!")
            return;
        }
        let logc = client.q_log(message.guild)
        if(!logc) {
            client.sendErr(message, "Error, please set a log channel before toggling the filter! (" + client.config.prefix + "setlog)")
            return;
        }
        let serverdata = JSON.parse(fs.readFileSync('./data/server_data/' + message.guild.id + '.json'))
        if(serverdata['censor'] == 0) {
            client.sendErr(message, "Error! The filter is already off!")
            return;
        }
        serverdata['censor'] = 0
        fs.writeFile('./data/server_data/' + message.guild.id + '.json', JSON.stringify(serverdata), async (error) => {
            if (error) {
                message.reply("Error occured: " + error)
            } else {
            client.channels.get(logc).send(`${message.author} Toggled The Filter Off`)
            message.guild.owner.send(`${message.author} Toggled The Filter Off`)
            console.log(`Turned On Filter for ${message.guild.name}`)
            client.sendSuccess(message, "Successfully toggled the filter off!", "Filter Toggled by " + message.author.username)
            }
        })
    }
}