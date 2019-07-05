exports.run = async (client,message,args) => {
    message.delete()
    let arg1 = args[0]
    let arg2 = args[1]
    let reason = ""
    args.shift()
    if(arg2) {
        reason = " for \"" + args.join(" ") + "\""
    }
    try {
    client.users.get(arg1).send("Hey! You have been banned from the ticket feature by " + message.author.username + reason)
    } catch(err) {
        client.sendErr(message, "User could not be DM'd (still banned)")
    }
    var user = client.users.get(arg1);
    client.msg("ticketBanned", `${message.author} banned user (${user})${user ? user.username : "Could not access username"} from the ticket command for ${reason}`)
    client.ticketerdb.get(arg1).update({banned: true, reason: reason, when: new Date()}).run();
}
exports.info = {
    name: 'ticketban',
    description: "Ban's user from the ticket feature",
    format: "{prefix}ticketban [userid]",
    aliases: ["tb"]
}