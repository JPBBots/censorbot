const Discord = require('discord.js')
const client = new Discord.Client()
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
    //load and set config
client.config = require('./config.js')
    //load filter file
client.filterfile = require('./modules/filter/filter.json')
    //set default broken state
client.broken = false
    //create global access discord import
client.discord = require('discord.js')
    //calling of any client def files
require("./modules/FUNCTION.js")(client); //etc.
const init = async () => {
const evtFiles = await readdir("./events/");
console.log(`Loading ${evtFiles.length} events...`);
    //event loading
evtFiles.forEach(file => {
  const eventName = file.split(".")[0];
  const event = require(`./events/${file}`);
  client.on(eventName, event.bind(null, client));
  delete require.cache[require.resolve(`./events/${file}`)];
});
}
    //startup
init()
    //login
client.login(client.config.token)
