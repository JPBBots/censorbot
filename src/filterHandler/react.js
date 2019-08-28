module.exports = async (client, reaction, user) => {
    var message = reaction.message;
    if (message.guild && message.guild.id == "264445053596991498") return;
    if (message.channel.nsfw) return;

    let member = message.guild.members.get(user.id) || await message.guild.members.fetch(user.id);

    var data = await client.rdb.get(message.guild.id).run();
    if (data.role && member.roles.has(data.role)) return;

    var response = client.filter.test(reaction.emoji.name, data.censor.react, data.filter, data.uncensor);
    if (response.censor.react) {
        var msg = message;
        var error;
        try {
            await reaction.users.remove(user);
        } catch (err) {
            console.log(`Shard ${client.shard.id} | ${message.guild.name} ${message.guild.id} ${err.message}`.red)
            error = "Error! Missing permission to manage messages!";
        }
        console.log(`Shard ${client.shard.id} | Removed reaction from ${user} ${user.username}: `.yellow + `${reaction.emoji.name}`.yellow.underline)
        var log = msg.guild.channels.get(data.log);
        if(!log) return;
        log.send(client.embeds.log([reaction.emoji.name, reaction.emoji.url || ""], reaction.message, response.method, 3, error));
        if (data.punish) {
            console.log("punish");
            var guildc = await client.punishdb.get(message.guild.id).run();
            if (!guildc || !guildc.amount) return;
            var role = message.guild.roles.get(guildc.role);
            if (!role) return;
            if (!guildc.users[user.id]) guildc.users[user.id] = 1;
            else guildc.users[user.id]++;
            if (guildc.users[user.id] >= guildc.amount) {
                member.roles.add(role);
                delete guildc.users[user.id];
                console.log(guildc)
                var embed = new client.discord.MessageEmbed()
                    .setTitle("User Punished")
                    .setDescription(`${user} Reached the max ${guildc.amount} warnings.\n\nThey have received the ${role} role as punishment!`)
                    .setColor("RED")
                    .setFooter("This system is heavily WIP!")
                log.send(embed);
            }
            client.punishdb.replace(guildc).run();
        }
    }

}