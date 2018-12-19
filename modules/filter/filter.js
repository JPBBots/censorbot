module.exports = (client, arg, guild) => {
    var SelfReloadJSON = require('self-reload-json');
    var byp = client.filterfile
    var linkbypass = new SelfReloadJSON('./modules/filter/linkbyp.json')
    let fs = require('fs')
    const words = Object.keys(byp)
    const arrays = byp
    res = false
    function stopped(arg, words, method) {
        res = [arg, words, method]
        return res
    }
    const emoji_lookup = {
        "🇦": "a",
        "🇧": "b",
        "🇨": "c",
        "🇩": "d",
        "🇪": "e",
        "🇫": "f",
        "🇬": "g",
        "🇭": "h",
        "🇮": "i",
        "🇯": "j",
        "🇰": "k",
        "🇱": "l",
        "🇲": "m",
        "🇳": "n",
        "🇴": "o",
        "🇵": "p",
        "🇶": "q",
        "🇷": "r",
        "🇸": "s",
        "🇹": "t",
        "🇺": "u",
        "🇻": "v",
        "🇼": "w",
        "🇽": "x",
        "🇾": "y",
        "🇿": "z"
    }
    for(i=0; i<arg.length; i++) {
        if(emoji_lookup[arg[i]] !== undefined) arg[i] = emoji_lookup[arg[i]]
    }
    //Arg Algorythms
    for(i=0; i < arg.length; i++) {
        if(arg[i] )
        if(arg[i].match(/http/gi)) {
            let ok = false
            linkbypass.links.forEach(bs => {
                let bsr = new RegExp(bs, 'gi')
                if(arg[i].match(bsr)) {
                    ok = true
                } 
            })
            if(ok == true) {
                arg = arg.filter(f => f !== arg[i])
            }
        } else {
            if(client.emojis.map(id => id.id).contains(arg[i].replace(/>/, "").split(":")[2])) {
               arg = arg.filter(f => f !== arg[i])
            } else {
               arg[i] = arg[i].replace(/("|\*|\.|'|\||-|\\|\/|`|\<|\>|@|#|!|&)/gi, '')
            }
        }
    }
        var result = ""
         function findone(arg,index) {
             if(arg[index].length === 1) {
                 result += arg[index]
                 arg.splice(index, 1)
                 if(arg[index] && arg[index].length === 1) {
                     findone(arg,index);
                 } else {
                     arg.push(result)
                     result = ""
                 }
             }
         }

         for(i=0; i<arg.length; i++) { 
             findone(arg, i)
         }
		 for(i=0;i<arg.length;i++) {
			 if(!arg[i]) continue;
			 if(!arg[i+1]) continue;
			 let arg1 = arg[i]
			 let arg2 = arg[i+1]
			 if(arg1.length == 2 && arg2.length == 2) {
				arg[i] = arg1+arg2
				arg[i+1] = ""
			 }
		 }

         for(i=0;i<arg.length;i++) {
             if(arg[i].match(/(.)\1+\1+\1+/)) {
             if(/s/.test(arg[i])) continue;
                 arg[i] = arg[i].replace(arg[i].match(/(.)\1+\1+\1+/)[0], arg[i].match(/(.)\1+\1+\1+/)[1])

         }
            if(/^\d+$/.test(arg[i])) {
                arg[i] = ""
            }
         }

    //End of Arg Algorythms
    //Custom filter
    try {
        JSON.parse(fs.readFileSync('./data/server_data/' + guild.id + '.json'))
    } catch (e) {
        console.log(guild.id)
        fs.writeFile('./data/server_data/' + guild.id + '.json', '{"censor":"1","role":"none","log":"none","filter":[]}')
        return;
    }
    let serverdat = JSON.parse(fs.readFileSync('./data/server_data/' + guild.id + '.json'))
    if(!serverdat) {
        fs.writeFile('./data/server_data/' + guild.id + '.json', '{"censor":"1","role":"none","log":"none","filter":[]}')
        serverdat = '{"censor":"1","role":"none","log":"none","filter":[]}'
    }
    if(serverdat['filter'][0]) {
        let serverfilter = serverdat['filter']
        stopcustom = false
        arg.forEach(arg => {
            arg = arg.replace(/0/g, 'o').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/1/g, 'l')
            serverfilter.forEach(word => {
                let custsio = new RegExp(word, 'gi')
                if(arg.match(custsio)) {
                    stopcustom = true
                }
            })
        })
        if(stopcustom) {
            stopped('Custom Filter', arg, "server")
        }
    }
    let okaytt = []
    let okayy = []
    let stop = false
    arg.forEach(arg => {
        arga = arg.replace(/0/g, 'o').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/1/g, 'l')
        words.forEach(words => {
            let word = new RegExp(words, 'gi')
            if (arga.match(word)) {
                const array = arrays[words.toLowerCase()]
                stop = true
                okaytt = word
                okayaa = arga
                array.forEach(bypass => {
                    let sio = new RegExp(bypass, 'gi')
                    if (arga.match(sio)) {
                        stop = false
                    }
                })
            }
        })
    })
    if (stop) {
        stopped(okayaa, okaytt, "base");
    }
    if(res !== false) return res;
    if(res === false) return false
}