exports.run = (client,message,args) => {
    const fs = require('fs')
    let arg1 = args[0]
    let arg2 = args[1]
    fs.copyFileSync('../filter/filter.json', '../filter/filterbackup.json')
	fs.writeFile('../filter/filter.json', JSON.stringify(client.filter.addToBypass(arg1, arg2), null, 4), "utf8", (err, dat) => {
		if(err) console.error(err);
		client.shard.broadcastEval("this.filter.reload()").then(r=>{
	        message.reply(`Added key ${arg2} to ${arg1}`).then(client.u.del(2000));
		}).catch(z=>client.sendErr(message, "Error occured"))
	})
}
exports.info = {
    name: 'f',
    description: 'Adds bypass to filter',
    format: "{prefix}f [key] [bypass]"
}