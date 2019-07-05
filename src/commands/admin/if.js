exports.run = (client, message, args) => {
    message.reply(eval(`if(${args.join(' ')}) { true } else { false }`))
}

exports.info = {
    name: 'updatebot',
    description: 'Updates bots status message.',
    format: "{prefix}updatebot"
}