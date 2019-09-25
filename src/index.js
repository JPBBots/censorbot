const Discord = require('discord.js')
const client = new Discord.Client()
const {
  promisify
} = require("util");
var colors = require('colors')
const readdir = promisify(require("fs").readdir);

const mappings = require("./mappings.js");
client.mappings = mappings;

client.config = require(mappings.config)
client.msg = require(mappings.assets.channels);
let db = require(mappings.assets.db);
db.init().then(_=>{ db.applyToObject(client) })
client.filterfile = require(mappings.filter.filter)
client.jpbfilter = require(mappings.filter.class);
client.embeds = require(mappings.assets.embeds)

require("./functions.js")(client);

global.client = client;

client.filter = new client.jpbfilter(client, "./filter.json", "./linkbyp.json");

client.broken = false
client.discord = Discord;
// require("./modules/functions.js")(client);

client.commands = new Discord.Collection();
const init = async () => {
  const evtFiles = await readdir(mappings.events);
  console.log(`>>> Loading ${evtFiles.length} events...`.bgRed);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });

  const adminFiles = await readdir(mappings.commands.admin);
  const settingFiles = await readdir(mappings.commands.settings);
  const normalFiles = await readdir(mappings.commands.normal);

  console.log(`>>> Loading ${adminFiles.length} admin commands, ${settingFiles.length} setting commands, & ${normalFiles.length} normal commands. ${adminFiles.length+settingFiles.length+normalFiles.length} total.`);

  client.filterHandler = {
    msg: require(mappings.filterHandler.msg),
    emsg: require(mappings.filterHandler.emsg),
    nick: require(mappings.filterHandler.nick),
    react: require(mappings.filterHandler.react)
  }

  adminFiles.forEach(file => {
    if (!file.endsWith(".js")) return;
    const stuff = require(`${mappings.commands.admin}/${file}`);
    stuff.info.admin = true;
    client.commands.set(file.split(".")[0], stuff);
  })
  settingFiles.forEach(file => {
    if (!file.endsWith(".js")) return;
    const stuff = require(`${mappings.commands.settings}/${file}`);
    stuff.info.setting = true;
    client.commands.set(file.split(".")[0], stuff);
  })
  normalFiles.forEach(file => {
    if (!file.endsWith(".js")) return;
    const stuff = require(`${mappings.commands.normal}/${file}`);
    client.commands.set(file.split(".")[0], stuff);
  })
}
init()
client.login(client.config.token)

let guildDB = require(mappings.assets.guildDB);

Discord.Guild.prototype.db = function() { return new guildDB(this, client.rdb) }