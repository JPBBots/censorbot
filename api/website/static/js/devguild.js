function addToFilter() {
    var newWord = document.getElementById("filterin").value;
    if(!newWord) return;
    if(newWord.match(/[^\w]/gi)) return alert("Illegal character. Make sure to only use letters");
    
    let newDom = document.createElement("option");
    newDom.value = newWord.toLowerCase();
    newDom.innerText = newWord.toLowerCase();
    
    document.getElementById("filter").appendChild(newDom);
    
    document.getElementById("filterin").value = "";
    causeChange();
}
function removeWord() {
    var wordToRemove = document.getElementById("filter").value;
    document.getElementById("filter")
        .removeChild(
            [...document.getElementById("filter")]
                .find(function(x) { return x.value == wordToRemove })
        );
    if(wordToRemove) causeChange();
}
function clearFilter() {
    document.getElementById("filter").innerHTML = "";
    causeChange();
}
function addToChannels() {
    var newChannel = document.getElementById("channeladd").value.split(" ")
    var has = false
    var channels = document.getElementById("channels")
    for (var i = 0; i < channels.childElementCount; i++) {
        if (channels.children[i].value == newChannel[1]) has = true
    }
    if(has) return alert("Channel is already ignored")
    var option = document.createElement("option")
    option.value = newChannel[1]
    option.innerText = "#" + newChannel[0]
    
    document.getElementById("channels").appendChild(option)
    causeChange()
}
function removeChannel() {
    var channelToRemove = document.getElementById("channels").value;
    document.getElementById("channels")
        .removeChild(
            [...document.getElementById("channels")]
                .find(function(x) { return x.value == channelToRemove })
        );
    if(channelToRemove) causeChange();
}
function clearChannels() {
    document.getElementById("channels").innerHTML = "";
    causeChange()
}

function addToUncensor() {
    var newWord = document.getElementById("uncensorin").value;
    if(!newWord) return;
    if(newWord.match(/[^\w]/gi)) return alert("Illegal character. Make sure to only use letters");
    
    let newDom = document.createElement("option");
    newDom.value = newWord.toLowerCase();
    newDom.innerText = newWord.toLowerCase();
    
    document.getElementById("uncensor").appendChild(newDom);
    
    document.getElementById("uncensorin").value = "";
    causeChange();
}
function removeUncensor() {
    var wordToRemove = document.getElementById("uncensor").value;
    document.getElementById("uncensor")
        .removeChild(
            [...document.getElementById("uncensor")]
                .find(function(x) { return x.value == wordToRemove })
        );
    if(wordToRemove) causeChange();
}
function clearUncensor() {
    document.getElementById("uncensor").innerHTML = "";
    causeChange();
}


//backups

function backupFilter() {
    document.getElementById('filterbackup').innerHTML = "<button class='sb' onclick='exportFilter()'>Export</button><button class='sb' onclick='importFilter()'>Import</button>"
}
function exportFilter() {
    const filter = buildObject().filter
    download(document.guild.name + ".cbfilter", JSON.stringify(filter))

    document.getElementById('filterbackup').innerHTML = "<button class='sb' onclick='backupFilter()'>Backup</button>"
}
function importFilter() {
    document.getElementById('filterbackup').innerHTML = "<input type='file' id='filterfile'><button class='sb' onclick='uploadFilter()'>Upload</button>"
}
function uploadFilter() {
    var file = document.getElementById('filterfile').files[0]
    fileContents(file, function(content) {
        var filter
        try {
            filter = JSON.parse(content)
        } catch {
            alert('Error Parsing File!')
        }
        if (!filter) return
        clearFilter()
        filter.forEach(function(word) {
            document.getElementById("filterin").value = word;
            addToFilter()
        })
    })    
    document.getElementById('filterbackup').innerHTML = "<button class='sb' onclick='backupFilter()'>Backup</button>"
}





function backupUncensor() {
    document.getElementById('uncensorbackup').innerHTML = "<button class='sb' onclick='exportUncensor()'>Export</button><button class='sb' onclick='importUncensor()'>Import</button>"
}
function exportUncensor() {
    const uncensor = buildObject().uncensor
    download(document.guild.name + ".cbuncensor", JSON.stringify(uncensor))

    document.getElementById('uncensorbackup').innerHTML = "<button class='sb' onclick='backupUncensor()'>Backup</button>"
}
function importUncensor() {
    document.getElementById('uncensorbackup').innerHTML = "<input type='file' id='uncensorfile'><button class='sb' onclick='uploadUncensor()'>Upload</button>"
}
function uploadUncensor() {
    var file = document.getElementById('uncensorfile').files[0]
    fileContents(file, function(content) {
        var uncensor
        try {
            uncensor = JSON.parse(content)
        } catch {
            alert('Error Parsing File!')
        }
        if (!uncensor) return
        clearUncensor()
        uncensor.forEach(function(word) {
            document.getElementById("uncensorin").value = word;
            addToUncensor()
        })
    })    
    document.getElementById('uncensorbackup').innerHTML = "<button class='sb' onclick='backupUncensor()'>Backup</button>"
}