exports.run = (client, message, args) => {
    const fs = require('fs')
    if(!args || args.size < 1) return message.reply("Must provide a command name to reload.");
    const commandName = args[0];
    console.log(require('path').resolve(__dirname, "modules/cmds"))
    if(client.commands.has(commandName)) {
        return message.reply("That command is already loaded");
    }   
    if(!fs.existsSync(`./modules/cmds/${commandName}.js`)) {
        return message.reply('That command could not be found!')
    }
    client.shard.broadcastEval(`
        const props = require('${__dirname.replace(/\\/g, '/')}/${commandName}.js')
        this.commands.set('${commandName}', props);
    `)
    message.reply(`The command ${commandName} has been loaded`);
}
exports.info = {
    name: 'load',
    description: 'Used to load unloaded parts',
    format: "{prefix}load [part]"
}