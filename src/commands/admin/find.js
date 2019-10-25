exports.run = async (client, message, args) => {
  const arg1 = args[0]
  const res = (await client.shard.broadcastEval(`
    var client = this;
    function go() {
        return {
            "gu": client.guilds.get("${arg1}"), 
            "shard": client.shard.id
        }
    };
    go()`
  ))
    .filter(x => x)[0]
  var { gu, shard } = res
  if (!gu) {
    const ok = await message.reply('Bot is not in guild')
    setTimeout(() => {
      ok.delete()
    }, 3000)
    return
  }
  if (gu) {
    var owner = await client.users.fetch(gu.ownerID) || {}
    message.channel.send(
      client.u.embed
        .setTitle('Fetched guild')
        .addField('Name', `${gu.name} | ${gu.id}`)
        .addField('Owner', `${owner} (${owner.tag} | ${owner.id})`)
        .addField('Member Count', `${gu.memberCount}`)
        .addField('Shard', `${shard}`)
    )
  }
}
exports.info = {
  name: 'find',
  description: 'Finds guild and if the bot is in it, returns guild stats/info',
  format: '{prefix}find [serverid]',
  aliases: ['getguild', 'findguild']
}
