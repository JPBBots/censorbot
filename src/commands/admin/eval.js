function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}


const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    if (message.author.id !== client.config.ownerID) return message.reply("only the owner can run this command");
    const s = (msg, opts) => message.channel.send(msg, opts);
    try {
        const code = args.join(" ").replace(/(‘|’)/g, "'").replace(/(“|”)/g, '"');
        let evaled = eval(code);

        if(evaled && evaled.then) evaled = await evaled;

        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);

        if (evaled.length > 2000) {
            message.reply('Response too big!')
        } else {
            message.channel.send(clean(evaled), {
                code: "xl"
            })
        }
    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
}
exports.info = {
    name: 'eval',
    description: 'evaluates script on backend',
    format: "{prefix}eval [script]"
}