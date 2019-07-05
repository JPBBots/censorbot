const {
    token
} = require("../config.js");
const {
    MessageEmbed
} = require("discord.js");
const fetch = require("node-fetch")

const Discord = require("discord.js")

const channels = {
    log: "399688995283533824",
    ticket: "509886529729200128",
    ticketLog: "517084909236649994",
    ticketBanned: "517088524730892308",
    statusLog: "450444337357258772",
    joinAndLeave: "456989243328299049",
    serverList: "413831069117186078",
    DMs: "449658955073978389"
}

function sendMessage(channel, content, embed) {
    return new Promise(r=>{
        if (!channels[channel]) return;
        fetch(`https://discordapp.com/api/channels/${channels[channel]}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bot ${token}`,
                },
                body: JSON.stringify(
                    {
                        content: content || null,
                        embed: embed ? embed instanceof Discord.MessageEmbed ? embed.toJSON() : embed.embed ? embed.embed : embed : null,
                    }
                )
            }
        )
            .then(x=>x.json())
            .then(r);
    })
}

module.exports = sendMessage;