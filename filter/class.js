module.exports = class JPBFilter {
    constructor(client, filterFile, linkBypFile) {
        this.filterFile = filterFile;
        this.filter = require(filterFile);
        this.linkBypFile = linkBypFile;
        this.linkByp = require(linkBypFile).links;
        this.client = client;
        this.replaceSpots = {
            spaces: /(\_|\/|\\|\.|\n|\&|\-|\+|\=|\:|\~|\,)/gi,
            nothing: /(\"|\*|\'|\||\`|\<|\>|\@|\#|\!|\(|\)|\[|\]|\{|\}|\;|\%)/gi
        }
        this.emoji_lookup = {
            "🇦": "a",
            "🇧": "b",
            "🅱": "b",
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
            "🇿": "z",
            "🖕": "fuck"
        }
    }
    reload() {
        this.reloadFilter();
        this.reloadLinkByp();
    }

    reloadFilter() {
        delete require.cache[require.resolve(this.filterFile)]
        this.filter = require(this.filterFile);
    }

    reloadLinkByp() {
        delete require.cache[require.resolve(this.linkBypFile)]
        this.linkByp = require(this.linkBypFile).links;
    }
    
    addToBypass(key, newValue) {
        if(!this.filter[key]) this.filter[key] = [];
        if(newValue) this.filter[key].push(newValue);
        return this.filter;
    }
    /**
     * 
     * @param {String} content - Content of message
     * @param {Boolean} GLOBAL - If global filter
     * @param {Array} SERVER - Server filter array
     * @param {Array} UNCENSOR - Uncensor array
     * @returns {Object<censor<Boolean>, method<String>, word<RegExp>, arg<String>>} - Response
     */
    test(content, GLOBAL = true, SERVER = false, UNCENSOR = false) {
        var res = {
            censor: false,
            method: "none",
            word: null,
            arg: null
        }
        const init = () => {
            if(UNCENSOR && UNCENSOR[0]) {
                var uncensorRes = this.testAgainstArray(this.resolveContent(content).join(" "), UNCENSOR);
                if(uncensorRes[0]) {
                    res.censor = false;
                    return;
                };
            }
            if(SERVER && SERVER[0]) {
                var serverFilter = this.testAgainstArray(this.resolveContent(content).join(" "), SERVER);
                if(serverFilter[0]) {
                    res.censor = true;
                    res.method = "server";
                    res.word = serverFilter[1];
                    res.arg = serverFilter[2];
                    return;
                }
            }
        
            if(GLOBAL) {
                var baseFilter = this.testWithBypass(this.resolveContent(content), this.filter)
                if(baseFilter) {
                    res.censor = true;
                    res.method = "base";
                    res.word = baseFilter[0]
                    res.arg = baseFilter[1]
                    return;
                }
            }
        }
        init();
        return res;
    }
    removeAccents(str) {
        var accents = "$ÀÁÂÃÄÅĄĀāàáâãäåąßβÒÓÔÕÕÖØŐòóôőõöøĎďDŽdžÈÉÊËĘèéêëęðÇçČčĆćÐÌÍÎÏĪìíîïīÙÚÛÜŰùűúûüĽĹŁľĺłÑŇŃňñńŔŕŠŚŞšśşŤťŸÝÿýŽŻŹžżźđĢĞģğµ§ṈṉΑΒΝΗΕΙΤƎ△ıскР¡"
        var accentsOut = "sAAAAAAAAaaaaaaaabbOOOOOOOOoooooooDdDZdzEEEEEeeeeeeCcCcCcDIIIIIiiiiiUUUUUuuuuuLLLlllNNNnnnRrSSSsssTtYYyyZZZzzzdGGggusNnABNHEITeaickpi";
        str = str.split('');
        var strLen = str.length;
        var i, x;
        for (i = 0; i < strLen; i++) {
            if ((x = accents.indexOf(str[i])) != -1) {
                str[i] = accentsOut[x];
            }
        }
        return str.join('');
    };
    resolveContent(str) {
        return this.resolvePlusCharacters(this.resolveTwos(this.resolveOnes(this.resolveEmoji(this.removeAccents(this.removeLinks(str.split(" ")).join(" ").replace(this.replaceSpots.spaces, " ").replace(this.replaceSpots.nothing, "")).slice().trim().split(/ +/g)))));
    }
    resolveEmoji(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (this.emoji_lookup[arr[i]]) arr[i] = this.emoji_lookup[arr[i]]
        }
        return arr;
    }
    resolveOnes(arr) {
        arr = arr.reduce(([last, acc], e) => {
            if (e.length === 1 && (!last || last.length === 1)) {
                if (acc.length === 0) {
                    acc.push(e)
                } else {
                    acc[acc.length - 1] += e
                }
            } else {
                acc.push(e)
            }
            return [e, acc]
        }, [undefined, []])[1]
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i + 1]) {
                if (arr[i].length == 1 && arr[i + 1].length == 1) {
                    arr[i] = arr[i] + arr[i + 1];
                    arr[i + 1] = "";
                } else if (arr[i].length == 1 && arr[i + 1].length != 1) {
                    arr[i + 1] = arr[i] + arr[i + 1];
                    arr[i] = "";
                } else continue;
            } else continue;
        }
        return arr
    }
    resolveTwos(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i]) continue;
            if (!arr[i + 1]) continue;
            let arr1 = arr[i]
            let arr2 = arr[i + 1]
            if (arr1.length == 2 && arr2.length == 2) {
                arr[i] = arr1 + arr2
                arr[i + 1] = ""
            }
        }
        return arr
    }
    resolvePlusCharacters(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].match(/(.)\1+\1+\1+/)) {
                if (/s/.test(arr[i])) continue;
                arr[i] = arr[i].replace(arr[i].match(/(.)\1+\1+\1+/)[0], arr[i].match(/(.)\1+\1+\1+/)[1])

            }
            if (/^\d+$/.test(arr[i])) {
                arr[i] = ""
            }
        }
        return arr
    }

    testAgainstArray(content, arr) {
        var res = false;
        var site;
        var arg;
        arr.forEach(a=>{
            let reg;
            try {
                reg = new RegExp(a, "gi");
            } catch(e) {
                console.log(a + "err");
            }
            if(!reg) return;
            var match = content.match(reg)
            if(match) {
                res = true;
                site = a;
                arg = match[0];
            }
        })
        return [res, site, arg];
    }
    testWithBypass(args, obj) {
        var res = false
        var stop = false;
        args.forEach(arg => {
            if(stop) return;
            Object.keys(obj).forEach(wrd => {
                if(stop) return;
                let word = new RegExp(wrd, 'gi')
                if (arg.match(word)) {
                    const array = obj[wrd.toLowerCase()]
                    stop = true
                    array.forEach(bypass => {
                        let sio = new RegExp(bypass, 'gi')
                        if (arg.match(sio)) {
                            stop = false
                        }
                    })
                    if(stop) {
                        return res = [word, arg];
                    }
                }
            })
        })
        return res;
    }
    removeLinks(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i])
                if (arr[i].match(/http/gi)) {
                    let ok = false
                    this.linkByp.forEach(bs => {
                        let bsr = new RegExp(bs, 'gi')
                        if (arr[i].match(bsr)) {
                            ok = true
                        }
                    })
                    if (ok == true) {
                        arr = arr.filter(f => f !== arr[i])
                    }
                }
        }
        return arr;
    }
    addNum() {
        require("fs").readFile('./num.json', (err, result) => {
            let u = JSON.parse(result)
            u['num'] += 1
            require("fs").writeFileSync('./num.json', JSON.stringify(u))
        })
    }
}