exports.run = async (client,message,args) => {
    let arg1 = args[0]
    let gu = (await client.shard.broadcastEval(`var gu = this.guilds.get("${arg1}"); if(gu) gu.shard = this.shard.id; gu`)).filter(x=>x!=null)[0]
    if (!gu) {
        let ok = await message.reply("Bot is not in guild")
        setTimeout(() => {
            ok.delete()
        }, 3000);
        return;
    }
    if (gu) {
        message.reply(`Bot in guild => Shard ${gu.shard} | ${client.users.get(gu.ownerID)} | ${gu.name} | ${gu.id} | ${gu.memberCount}`)
    }
}
exports.info = {
    name: 'find',
    description: 'Finds guild and if the bot is in it, returns guild stats/info',
    format: "{prefix}find [serverid]",
    aliases: ["getguild", "findguild"]
}