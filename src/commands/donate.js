exports.run = (client,message,args) => {
    message.delete()
    message.reply('Donate (All goes towards development of new features/new products!): ' + client.config.donate)
}
exports.info = {
    name: 'donate',
    description: "Donate towards the development of {name}",
    format: "{prefix}donate"
}