exports.run = (client,message,args) => {
    client.broken = true
    message.delete()
    client.user.setActivity('API BROKEN')
    client.user.setStatus("dnd")
    return;
}
exports.info = {
    name: 'apibreak',
    description: 'Causes bot to go into broken mode',
    format: "{prefix}apibreak"
}