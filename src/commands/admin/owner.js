exports.run = (client, message, args) => {
  client.shard.broadcastEval(`this.guilds.array().filter(x=>x.owner && x.owner.id == "${args[0]}").map(x=>{ return {id: x.id, name: x.name, shard: this.shard.id} })`)
    .then(a => {
      let result = []
      a.forEach(res => { if (res) { result = result.concat(res) } })
      console.log(result)
      var user = client.users.get(args[0])
      const newE = new client.discord.MessageEmbed()
        .setTitle(`Testing ${user ? user.username : args[0]} (${args[0]})`)
        .setDescription(`This user owns ${result.length} guilds`)
      result.forEach(results => {
        newE.addField(`Guild: ${results.name}`, `ID: ${results.id} | Shard: ${results.shard}`)
      })
      message.channel.send(newE)
    })
}
exports.info = {
  name: 'owner',
  description: 'Tests for if user has a guild',
  format: '{prefix}owner'
}
