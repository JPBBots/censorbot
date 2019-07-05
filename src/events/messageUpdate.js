module.exports = async (client, oldMessage, newMessage) => {
    if(oldMessage.author.bot) return;
    if(!oldMessage.guild) return;
    if(oldMessage.guild.id == "264445053596991498") return;
    if(oldMessage.guild.id == "110373943822540800") return;
    if(oldMessage.guild.id == "417131675701477386") return;
    require(client.mappings.filterHandler.emsg)(client, oldMessage, newMessage)
}