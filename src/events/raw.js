module.exports = (client, d) => {
    if (d.op !== 0 || !['GUILD_MEMBER_UPDATE', 'MESSAGE_REACTION_ADD', 'MESSAGE_UPDATE'].includes(d.t)) return
    
    switch (d.t) {
        case 'GUILD_MEMBER_UPDATE':
            client.filterHandler.nick(client, d.d)
            break
        case 'MESSAGE_REACTION_ADD':
            client.filterHandler.react(client, d.d)
            break
        case 'MESSAGE_UPDATE':
            client.filterHandler.emsg(client, d.d)
            break
    }
}