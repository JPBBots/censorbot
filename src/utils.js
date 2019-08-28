const Discord = require('discord.js');
const fetch = require('node-fetch');
const moment = require("moment");
require("moment-duration-format");
module.exports = class JPBUtil {
    constructor(client) {
        this.client = client;
        this.requestTypes = ["GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE"];
        this.api = "https://discordapp.com/api"
    };
    get shardID() {
        return this.client.ws.shards.first().id;
    };
    get shardCount() {
        return this.client.options.totalShardCount;
    };
    get embed() {
        return new Discord.MessageEmbed();
    };
    get Discord() {
        return Discord;
    };
    request(ENDPOINT, METHOD = "GET", BODY = {}, HEADERS = {}, RESPONSE_TYPE = "json") {
        var util = this;
        return new Promise(function (resolve, reject) {
            if (!ENDPOINT) return reject("Missing endpoint");
            METHOD = METHOD.toUpperCase();
            if (!util.requestTypes.includes(METHOD)) reject("Invalid method");
            var headers = {
                "Content-Type": "application/json",
                "Authorization": "Bot " + util.client.token,
                ...HEADERS
            };
            fetch(util.api + (ENDPOINT.startsWith("/") ? ENDPOINT : "/" + ENDPOINT), {
                    method: METHOD,
                    headers: headers,
                    body: Object.entries(BODY)[0] ? JSON.stringify(BODY) : null
                })
                .then(function (rawResponse) {
                    if (!rawResponse || !rawResponse.ok || rawResponse.status !== 200) reject(rawResponse.status + " DiscordAPIError")
                    else return rawResponse[RESPONSE_TYPE]();
                })
                .then(function (response) {
                    resolve(response);
                });
        });
    };
    sendMessage(channelID, messageContent, embed) {
        var util = this;
        return new Promise(function (resolve, reject) {
            util.request("/channels/" + channelID + "/messages", "POST", {
                content: messageContent,
                embed: embed ? embed instanceof Discord.MessageEmbed ? embed.toJSON() : embed.embed ? embed.embed : embed : undefined
            }).then(function (Message) {
                util.getChannel(Message.channel_id).then(function (Channel) {
                    resolve(new Discord.Message(util.client, Message, Channel));
                }).catch(reject);
            }).catch(reject);
        });
    };
    getChannel(ID) {
        var util = this;
        return new Promise(function (resolve, reject) {
            var cachedChannel = util.client.channels.get(ID)
            if (cachedChannel) return resolve(cachedChannel);
            util.request("/channels/" + ID).then(function (Channel) {
                util.getGuild(Channel.guild_id).then(function (Guild) {
                    return resolve(new Discord.TextChannel(Guild, Channel));
                }).catch(reject);
            }).catch(reject);
        });
    };
    getGuild(ID) {
        var util = this;
        return new Promise(function (resolve, reject) {
            var cachedGuild = util.client.guilds.get(ID);
            if (cachedGuild) return resolve(cachedGuild);
            util.request("/guilds/" + ID).then(function (Guild) {
                return resolve(new Discord.Guild(util.client, Guild));
            }).catch(reject);
        });
    };
    uncachedReactions() {
        var util = this;
        var client = this.client;
        const events = {
            MESSAGE_REACTION_ADD: 'messageReactionAdd',
            MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
        };
        return client.on("raw", async event => {
            if (!events.hasOwnProperty(event.t)) return;
            const data = event.d;
            const user = client.users.get(data.user_id);
            const channel = await util.getChannel(data.channel_id);

            const message = await channel.messages.fetch(data.message_id);

            const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
            const reaction = message.reactions.get(emojiKey);

            client.emit(events[event.t], reaction, user);
        });
    }
    permissionBit(Permission) {
        return new Discord.Permissions(Permission).bitfield;
    };
    resolvePermission(Permission, BIT) {
        var bit = this.permissionBit(Permission);
        return (BIT & bit) != 0;
    };
    del(time) {
        return function(message) {
            setTimeout(() => {
                message.delete()
            }, time);
        };
    }
    momentTime(time) {
        return moment.duration(Math.abs(time));
    }
    momentFormat(moment) {
        return moment.format("Y [years], M [months], D [days], H [hours], m [minutes], s [seconds]")
    }
    moment(date) {
        return this.momentFormat(this.momentTime(new Date().getTime() - date.getTime()))
    }
    momentFormatTime(time) {
        return this.momentFormat(this.momentTime(time));
    }
    userEmbed(USER, color = "RANDOM") {
        var embed = this.embed
            .setTitle("User Info")
            .setColor(color)
            .setDescription(`${USER} | ${USER.tag} (${USER.id})`)
            .addField("Join Date", this.formatDate(USER.createdAt), true)
            .addField("On Discord For", moment.duration(Math.abs(new Date().getTime() - USER.createdAt.getTime())).format("Y [years], M [months], D [days],[\n],H [hours], m [minutes], s [seconds]").replace(",[],", "\n"), true)
            .addField("Presence", `${USER.presence.status}${USER.presence.clientStatus ? ` on ${Object.keys(USER.presence.clientStatus)[0]}`: ""}${USER.presence.activity ? ` ${USER.presence.activity.type} ${USER.presence.activity.name}` : ""}`, true)
            .addField("Shared Guilds", this.client.guilds.filter(x=>x.members.has(USER.id)).size, true)
            .setThumbnail(USER.displayAvatarURL())
        return embed;
    }
    async ShardUserEmbed(USER, color = "RANDOM") {
        var embed = this.embed
            .setTitle("User Info")
            .setColor(color)
            .setDescription(`${USER} | ${USER.tag} (${USER.id})`)
            .addField("Join Date", this.formatDate(USER.createdAt), true)
            .addField("On Discord For", moment.duration(Math.abs(new Date().getTime() - USER.createdAt.getTime())).format("Y [years], M [months], D [days],[\n],H [hours], m [minutes], s [seconds]").replace(",[],", "\n"), true)
            .addField("Presence", `${USER.presence.status}${USER.presence.clientStatus ? ` on ${Object.keys(USER.presence.clientStatus)[0]}`: ""}${USER.presence.activity ? ` ${USER.presence.activity.type} ${USER.presence.activity.name}` : ""}`, true)
            .addField("Shared Guilds", (await this.client.shard.broadcastEval(`this.guilds.filter(x=>x.members.has("${USER.id}")).size`)).reduce((a,b)=>a+b,0), true)
            .setThumbnail(USER.displayAvatarURL())
        return embed;
    }
    formatDate(date) {
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];
      
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
      
        return monthNames[monthIndex] + ' ' + day + ' ' + year;
    }
    resolveTag(tag) {
        return this.client.users.find(x=>x.tag == tag);
    }
    async sendAsWebhook(user, channel, message) {
        var webhook = await channel.createWebhook(user.username, {
            avatar: user.avatarURL()
        });
        var msg = await webhook.send(message);
        await webhook.delete();
        return msg;
    }
    async getEmoji(emojiID) {
        var res = await client.shard.broadcastEval(`this.emojis.get("${emojiID}")`)
        console.log(res);
        return res.filter(x=>x)[0];
    }
};