exports.run = async (client, message, args, db) => {
    message.delete();
    var type = args[0];
    if (!type) {
        var types = {
            "set": "Setup punishments for this server",
            "toggle": "Toggle punishments for this server",
            "current": "Look at the current punishments for this server",
            "user": "Specific user warnings/set users warnings"
        }
        var embed = new client.discord.MessageEmbed()
            .setTitle("Punishments")
            .setColor("DARK_VIVID_PINK")
            .setFooter("This is heavily WIP, if there's something missing or it glitches do not be suprised!!");
        var description = "Commands:\n"
        Object.keys(types).forEach(type => {
            description += `${client.config.prefix}punishments __${type}__: ${types[type]}\n`;
        })
        embed.setDescription(description);
        return message.channel.send(embed);
    }
    if (type == "set") {
        var amount = args[1];
        var role = args[2];
        if (!amount) {
            var embed = new client.discord.MessageEmbed()
                .setTitle("Setting Punishments")
                .setColor("DARK_VIVID_PINK")
                .setDescription(`Format: ${client.config.prefix}punishments set [AMOUNT] [ROLE]\n\nAMOUNT: Amount of times someone can curse until they're punished\nROLE: Role mention @Role`);
            return message.channel.send(embed).then(client.d(20000));
        }
        amount = Number(amount);
        if (!amount) {
            return client.sendErr(message, "Invalid amount, not a number.");
        }
        if (!role || !message.mentions.roles.first()) {
            return client.sendErr(message, "Invalid role, make sure to mention it!");
        }
        if (amount < 1) {
            return client.sendErr(message, "Amount must be more than 0");
        }
        var cur = await client.punishdb.get(message.guild.id).run();
        var current = "";
        if (!cur) current = "None";
        else current = `Amount: ${cur.amount} | Role: ${message.guild.roles.get(cur.role)}`;
        var res = await client.sendSettings(message, ["Punishments", current, `Amount: ${amount} | Role ${message.mentions.roles.first()}`], [`Set new punishment data to ${amount} | @${message.mentions.roles.first().name}`, "Punishments set by " + message.author.tag], [false, false], )
        if (res == 200) {
            db.set("punish", true)
            if (!cur) client.punishdb.insert({
                id: message.guild.id,
                amount: amount,
                role: message.mentions.roles.first().id,
                users: {
                    "placeholder": true
                }
            }).run();
            else client.punishdb.update(message.guild.id, {
                amount: amount,
                role: message.mentions.roles.first().id,
                users: {
                    "placeholder": true
                }
            }).run();
            return;
        }
    } else if (type == "toggle") {
        var cur = await db.get("punish");
        var newT = cur.swap();
        if (newT == true) {
            var pc = await client.punishdb.getAll(message.guild.id)
            if (!pc || !pc.role || !pc.amount) {
                return client.sendErr(message, "Cannot toggle on without already being set. Try " + client.config.prefix + "punishments set");
            }
        }
        var res = await client.sendSettings(message, ["Punishment Toggle", cur, newT], [`Toggled Punishments ${newT ? "ON" : "OFF"}`, "Punishments toggled by " + message.author.tag]);
        if (res == 200) {
            db.set("punish", newT)
        }
    } else if (type == "current") {
        var cur = await client.punishdb.getAll(message.guild.id)
        if (!cur) return client.sendErr(message, "There is no set data! Try " + client.config.prefix + "punishments set");
        var embed = new client.discord.MessageEmbed()
            .setTitle("Current Punishment Setting")
            .addField("Amount", cur.amount, true)
            .addField("Role", message.guild.roles.get(cur.role), true);
        message.channel.send(embed);
    } else if (type == "user") {
        var punishments = await client.punishdb.getAll(message.guild.id);
        if(!punishments) return client.sendErr(message, "Cannot interact with users without punishments set up! Try " + client.config.prefix + "punishments set");
        var user = args[1];
        var etc = args[2];
        if (!user) {
            var embed = new client.discord.MessageEmbed()
                .setTitle("Punishment info on user")
                .setDescription(`Commands:\n\n...user @User: Displays user warnings.\n...user @User set <NUMBER>: Set's warnings to <NUMBER>\n...user @User reset: Resets users warnings.`)
                .setFooter("Heavily WIP!")
                .setColor("DARK_VIVID_PINK")
            return message.channel.send(embed).then(client.d(7000))
        }
        if (!message.mentions.users.first() || !user.match(/<@.+>/g)) return client.sendErr(message, "Invalid user mention.")
        var user = message.mentions.users.first();
        if (!etc) {
            var embed = new client.discord.MessageEmbed()
                .setTitle("User punishment info")
                .setDescription(`${user} warnings: ${punishments.users[user.id] || "none"}`)
                .setFooter("WIP")
                .setThumbnail(user.displayAvatarURL());
            return message.channel.send(embed).then(client.d(4000))
        } else if (etc == "set") {
            var num = args[3];
            if (!num) return client.sendErr(message, "Format: ...user @User set <NUMBER>");
            num = Number(num);
            if (isNaN(num)) return client.sendErr(message, "Invalid number given");
            if(num < 1) return client.sendErr(message, "Warnings can't be 0 or under (Use ...user @User reset)");
            if(num >= punishments.amount) return client.sendErr(message, "You can't set a users warnings more than or equal too the punish amount!");
            var res = await client.sendSettings(message, [`${user.tag} Warnings`, punishments.users[user.id] || "none", num], [`Set ${user.tag}'s warnigns to ${num}`, "Warnings changed by " + message.author.tag]);
                if(res == 200) {
                    punishments.users[user.id] = num;
                    client.punishdb.update(message.guild.id, punishments)
                }
        } else if (etc == "reset") {
            if(!punishments.users[user.id]) return client.sendErr("User already doesn't have any warnings!");
            var res = await client.sendSettings(message, [`${user.tag} Warnings`, punishments.users[user.id], "none"], [`Set ${user.tag}'s warnigns to none`, "Warnings changed by " + message.author.tag]);
                if(res == 200) {
                    delete punishments.users[user.id]
                    client.punishdb.update(message.guild.id, punishments)
                }
        }
    } else {
        return client.sendErr(message, "Invalid type `" + type + "`");
    }
}
exports.info = {
    name: 'punishments',
    description: 'Set up punishments for when users curse',
    format: "{prefix}punishments"
}