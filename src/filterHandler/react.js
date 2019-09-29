module.exports = async(client, reaction, user) => {
    var message = reaction.message;
    if (message.guild && message.guild.id == "264445053596991498") return;
    if (message.channel.nsfw) return;

    let member = message.guild.members.get(user.id) || await message.guild.members.fetch(user.id);

    var data = await client.rdb.getAll(message.guild.id);
    if (data.role && member.roles.has(data.role)) return;
    if (!data.censor.react) return;



    var response;
    if (client.serverFilters[message.guild.id]) response = client.serverFilters[message.guild.id].test(reaction.emoji.name, true, data.filter, data.uncensor)
    else response = response = client.filter.test(reaction.emoji.name, data.base, data.filter, data.uncensor);
    if (response.censor) {
        var msg = message;
        var error;
        try {
            await reaction.users.remove(user);
        }
        catch (err) {
            console.log(`Shard ${client.shard.id} | ${message.guild.name} ${message.guild.id} ${err.message}`.red)
            error = "Error! Missing permission to manage messages!";
        }
        console.log(`Shard ${client.shard.id} | Removed reaction from ${user} ${user.username}: `.yellow + `${reaction.emoji.name}`.yellow.underline)
        var log = msg.guild.channels.get(data.log);
        if (!log) return;
        log.send(client.embeds.log([reaction.emoji.name, reaction.emoji.url || ""], reaction.message, response.method, 3, error));
        if (data.punishment.on) {
            console.log("punish");
            var role = msg.guild.roles.get(data.punishment.role);
            if (!role) return;
            var use = await client.punishdb.find({ u: msg.author.id, g: msg.guild.id });
            if(!use) return client.punishdb.create(null, {u: msg.author.id, g: msg.guild.id, a: 1});
            if (use.a + 1 >= data.punishment.amount) {
                msg.member.roles.add(role);
                client.punishdb.delete({ u: msg.author.id, g: msg.guild.id });
                var embed = new client.discord.MessageEmbed()
                    .setTitle("User Punished")
                    .setDescription(`${msg.author} Reached the max ${data.punishment.amount} warnings.\n\nThey have received the ${role} role as punishment!`)
                    .setColor("RED")
                    .setFooter("This system is heavily WIP!")
                log.send(embed);
            }
            else {
                client.punishdb.add({ u: msg.author.id, g: msg.guild.id }, "a", 1);
            }
        }
    }

}
