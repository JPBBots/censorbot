exports.run = (client,message,args) => {
    let arg1 = args[0]
    let arg2 = args[1]
    let user = client.users.get(arg1)
    let msg = args.slice(1).join(' ');
    user.send(msg)
    return;
}
exports.info = {
    name: 'sendmsg',
    description: 'Used to send message to user',
    format: "{prefix}sendmsg [userid] [message]"
}