exports.run = async (client,message,args) => {
    var res = client.filter.test(message.content, true);
    if(res.word) res.word = res.word.toString();
    message.channel.send(client.u.embed
        .setTitle("Filter Test")
        .setDescription("Result: \n```"+ JSON.stringify(res, null, 1) +"```")
        .setColor("RED")
    )
}
exports.info = {
    name: 'test',
    description: "Puts string against filter and returns results",
    format: "{prefix}test [string to test]"
}