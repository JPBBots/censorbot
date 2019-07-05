exports.run = async (client, message, args) => {
    client.shard.fetchClientValues(`ws.reconnecting`)
        .then(result=>{
            var out = false;
            for(var i=0; i<result.length;i++) {
                if(result[i] === true) {
                    message.reply(`Shard ${i} out`);
                    out = true;
                }
            }
            if(!out) return message.reply("No shards out");
        })
}
exports.info = {
    name: 'shardtest',
    description: "Finds broken shards",
    format: "{prefix}shardtest"
}