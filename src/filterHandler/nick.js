module.exports = async (client, oldMember, newMember) => {
    if (oldMember.guild && oldMember.guild.id == "264445053596991498") return;
    if (oldMember.displayName == newMember.displayName) return;
    var oldDisplayName = oldMember.displayName;
    var newDisplayName = newMember.displayName;
    var data = await client.rdb.get(oldMember.guild.id).run();
    if (data.role && newMember.roles.has(data.role)) return;

    var response = client.filter.test(newDisplayName, data.censor.nick, data.filter, data.uncensor);

    if (response.censor) {
        var error;
        try {
            await newMember.setNickname("");
        } catch (err) {
            console.log(`Shard ${client.shard.id} | ${oldMember.guild.name} ${oldMember.guild.id} ${error.message}`.red)
            error = "Error! Missing permission to manage messages!";
        }
        console.log(`Shard ${client.shard.id} | Changed innapropriate nickname of ${newMember.user} ${newMember.user.username}: `.yellow + `${newDisplayName}`.yellow.underline)
        client.c_log(`Shard ${client.shard.id} | Deleted oldMessage from ${oldMember.user.tag} ${oldMember.user.username}: | Server: ${oldMember.guild.name} ${oldMember.guild.id}`, client.embeds.adminLog(oldDisplayName, oldMember.user, {
            arg: response.arg,
            word: response.word
        }))
        var log = oldMember.guild.channels.get(data.log);
        if (!log) return;
        log.send(client.embeds.log([oldDisplayName, newDisplayName], oldMember, response.method, 2, error, response));
        if (data.punish) {
            console.log("punish");
            var guildc = await client.punishdb.get(oldMember.guild.id).run();
            if (!guildc || !guildc.amount) return;
            var role = oldMember.guild.roles.get(guildc.role);
            if (!role) return;
            if (!guildc.users[oldMember.user.id]) guildc.users[oldMember.user.id] = 1;
            else guildc.users[oldMember.user.id]++;
            if (guildc.users[oldMember.user.id] >= guildc.amount) {
                oldMember.roles.add(role);
                delete guildc.users[oldMember.user.id];
                console.log(guildc)
                var embed = new client.discord.MessageEmbed()
                    .setTitle("User Punished")
                    .setDescription(`${oldMember.user} Reached the max ${guildc.amount} warnings.\n\nThey have received the ${role} role as punishment!`)
                    .setColor("RED")
                    .setFooter("This system is heavily WIP!")
                log.send(embed);
            }
            client.punishdb.replace(guildc).run();
        }
    }
}