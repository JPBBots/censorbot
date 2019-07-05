exports.run = (client,message,args) => {
    message.delete()
    message.reply('Donate (All goes towards development of new features/new products!): ' + client.config.donate)
    console.log(`Shard ${client.shard.id} | ${message.author} ${message.author.username} Requested Donation...`)
    client.msg("log", `${message.author} ${message.author.username} Requested Donation...`)
}
exports.info = {
    name: 'donate',
    description: "Donate towards the development of {name}",
    format: "{prefix}donate"
}