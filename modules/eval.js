module.exports = async (client) => {
    client.on("message", async (message) => {
        const args = message.content.split(" ").slice(1);

        function clean(text) {
            if (typeof(text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
        }



        if (message.content.startsWith(client.config.prefix + "eval")) {
            const botowner = client.users.get(client.config.ownerID)
            if (message.author != botowner) {
                message.reply("You do not have permission to run this command!")
                return;
            }
            try {
                const code = args.join(" ");
                let evaled = eval(code);

                if (typeof evaled !== "string")
                    evaled = require("util").inspect(evaled);

                message.channel.send(clean(evaled), {
                    code: "xl"
                });
            } catch (err) {
                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
            }
        }
    });
}
