const Discord = require('discord.js');
const bot = new Discord.Client();
//Start of Status + Game Playing

bot.on("ready", () => {
console.log('Bot Started...');
bot.user.setStatus("online");
bot.user.setGame('In Development');
const logchannel = bot.channels.get("399688995283533824")
logchannel.send("Bot Either Crashed Or Was Restarted... BOT ONLINE")
});
//End of Status + Game Playing
//Start Of Bot Join Message

//End Of Bot Join Message
//Start of Basic Filter
bot.on('message', (message) => {
if(message.author.bot) return;
    if (message.author.id !='270198738570444801' && message.author.id !='394019914157129728' && message.author.id !='204255221017214977') {
  if (message.guild.id !='110373943822540800' && message.guild.id !='149220234690166785' &&  message.guild.id !='343024903735214081' &&  message.guild.id !='380174860523143169' && message.guild.id !='398122224638492676') {
if(message.channel.id == "413185119080153088") return;    
if(message.channel.id == "413825688076943362") return;
	if (message.content.match(/(b i t c|bit c|b itc|b it c|kys|k y s|k ys|ky s|dick| dic |d l c|dlc|d i c| dic|cunt|c u n t|bitch|bish|shit|fuc|p0rn|nig|d1c|d 1 c|n l g|n i g|n 1 g|n1g|nlg|n!g|bast|wank|f ag|fa g|fag|f4g|f 4 g|f a g|f @ g|f@g|sex |tits|8--|8==|dild|porn|fuk|slut|whore|retard|f u c k|cock|nibba|f u k|f.u.c)/gi)) {
   message.reply("You're not allowed to say that...")
   message.delete()
    console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.tag} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id} | Channel: ${message.channel.name} ${message.channel.id}`)   
} 
  if (message.content == 'dic') {
         message.reply("You're not allowed to say that...")
   message.delete()
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
   const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
  }
       
      if (message.guild.id !='276450119598080000' && message.guild.id !='399453498674249739') {
        if (message.content.match(/(vagin|v.a.g.i.n| ass)/gi)) {
   message.reply("You're not allowed to say that...")
   message.delete()
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
            const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
  } 
  if (message.content == 'ass') {
         message.reply("You're not allowed to say that...")
   message.delete()
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
  const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
  }
  if (message.content == 'penis') {
         message.reply("You're not allowed to say that...")
   message.delete()
   console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
  const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
  }
           if (message.guild.id !='149220234690166785' &&  message.guild.id !='343024903735214081' &&  message.guild.id !='380174860523143169' && message.guild.id !='398122224638492676') {
if (message.content == 'sex') {
   message.reply("You're not allowed to say that...")
   message.delete()
    console.log(`Deleted message from ${message.author} ${message.author.username}: ${message.content}`)
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Deleted message from ${message.author} ${message.author.username}: ${message.content} | Server: ${message.guild.name} ${message.guild.id}`) 
} 
    }
      }
      }
    }
});
//End of Basic Filter
//Start Of Edited Messages Filter
//Start of Specified Filter

   bot.on('messageUpdate', (newMessage, oldMessage, guild) => {

       if(oldMessage.guild.id == "149220234690166785") return;
	   if(oldMessage.guild.id == "110373943822540800") return;

    if (oldMessage.content.match(/(b i t c|bit c|b itc|b it c|kys|k y s|k ys|ky s|dick| dic |d l c|dlc|d i c| dic|cunt|c u n t|bitch|bish|shit|fuc|p0rn|nig|d1c|d 1 c|n l g|n i g|n 1 g|n1g|nlg|n!g|bast|wank|f ag|fa g|fag|f4g|f 4 g|f a g|f @ g|f@g|sex |tits|8--|8==|dild|porn|fuk|slut|whore|retard|f u c k|cock|nibba|f u k|f.u.c)/gi)) {

 

   oldMessage.reply("You're not allowed to say that...")

 

   oldMessage.delete()

 

    console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

    const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)  

 

}

 

  if (oldMessage.content == 'dic') {

 

         oldMessage.reply("You're not allowed to say that...")

 

   oldMessage.delete()

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

   const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

 

  }

 

       

 

      if (oldMessage.guild.id !='276450119598080000' && oldMessage.guild.id !='399453498674249739') {

 

        if (oldMessage.content.match(/(vagin|v.a.g.i.n| ass)/gi)) {

 

   oldMessage.reply("You're not allowed to say that...")

 

   oldMessage.delete()

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

            const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

 

  }

 

  if (oldMessage.content == 'ass') {

 

         oldMessage.reply("You're not allowed to say that...")

 

   oldMessage.delete()

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

  const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

 

  }

 

  if (oldMessage.content == 'penis') {

 

         oldMessage.reply("You're not allowed to say that...")

 

   oldMessage.delete()

 

   console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

  const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

 

  }

 

           if (oldMessage.guild.id !='149220234690166785' &&  oldMessage.guild.id !='343024903735214081' &&  oldMessage.guild.id !='380174860523143169' && oldMessage.guild.id !='398122224638492676') {

 

if (oldMessage.content == 'sex') {

 

   oldMessage.reply("You're not allowed to say that...")

 

   oldMessage.delete()

 

    console.log(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content}`)

 

    const logchannel = bot.channels.get("399688995283533824")

 

    logchannel.send(`Deleted oldMessage from ${oldMessage.author} ${oldMessage.author.username}: ${oldMessage.content} | Server: ${oldMessage.guild.name} ${oldMessage.guild.id}`)

 

}

 

    }

 

     

 

     

 

    }

 

});

 

//End of Specified Filter
//End Of Edited Messages Filter
//Start of Specified Filter

//End of Specified Filter
//End Of Chatfilter
//Start of Nickname Filter
bot.on('guildMemberUpdate', (newMember, oldMember, guild) => {
    
if (oldMember.displayName.match(/(b i t c|bit c|b itc|b it c|kys|k y s|k ys|ky s|dick| dic |d l c|dlc|d i c| dic|cunt|c u n t|bitch|bish|shit|fuc|p0rn|nig|d1c|d 1 c|n l g|n i g|n 1 g|n1g|nlg|n!g|bast|wank|f ag|fa g|fag|f4g|f 4 g|f a g|f @ g|f@g|sex |tits|8--|8==|dild|porn|fuk|slut|whore|retard|f u c k|cock|nibba|f u k|f.u.c)/gi)) {
if (oldMember.guild.id !='110373943822540800') {    
oldMember.setNickname(' ')
    console.log(`Changed username of ${oldMember.id} because it was innapropriate`)   
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send(`Changed username of ${oldMember.id} because it was innapropriate`) 

}}
})

//End of Nickname Filter
//Start of Fun Reactions
var funreactions = 'off'
bot.on('message', (message) => {
if(message.author.bot) return;
if(message.guild.id == "110373943822540800") return;    
	if (message.content == '+ping') {
  message.reply('Pong!')
}
if (message.content == '(?°?°)?? ???') {
  message.channel.send('---? ?( ?-??)')
  message.channel.send('denied...')
} 
if (message.content == ('+kitty')) {
  message.channel.send('https://cdn.discordapp.com/attachments/276450119598080000/399667946412048385/black-cats-pictures-12.jpg')
} 
if (message.content == '+ding') { 
  message.reply('Dong!')
}
if (message.content == 'hipton') {
  message.channel.send('is thuh best')
}
if (message.content == '<o/') {
  message.channel.send('on the haters')
}
if (message.content == '+allstar') {
   message.channel.send('Once again')
}
if (message.content == 'oh noes') {
   message.reply('Nuh')
}    
if (message.content == 'brb') {
   message.reply('see yah in a bit!')
}  
if (message.content == 'back') {
   message.reply('welcome back')
}  
if (message.content == 'gtg') {
   message.reply('Byeeee!')
}  
if (message.content == 'soviet union') {
   message.channel.send('was murdered by <@285210257095917569>') 
}
if (message.content == '+lunar') {
   message.channel.send('legion') 
   message.channel.send('legion') 
}
if (message.content == '+aegis') {
   message.channel.send('Screw Titans and Warlocks. Hunters are the way to go.')
}
if (message.content == 'kys') {
   message.channel.send('*no u*') 
}
    if (message.guild.id !='380174860523143169') {
if (message.content.match(/Hunter Master Race/i)) {
   message.channel.send('Warlock Master Race')
}
if (message.content.match(/Titan Master Race/i)) {
   message.channel.send('Warlock Master Race')
}
    }
if (message.content == 'yo muh name is joe and im from idaho... so fucc u') {
   message.channel.send('<@367455577821020190>') 
   message.channel.send('<@367455577821020190>') 
   message.channel.send('<@367455577821020190>') 
   message.channel.send('<@367455577821020190>') 
}
if (message.content == '@everyjuan') { 
   message.channel.send('dont tag me!!')
}

if (message.content == 'dickeo') {
   message.channel.send('https://www.tenor.co/ozsg.gif')
}
if (message.content == 'dun') {
   message.channel.send('succ = x*7 therefore, roblox = game/done = rek')
}
   
});

//End of Fun Reactions

//Start of Use Commands
bot.on('message', message => {
        const logchannel = bot.channels.get("399688995283533824")

if (message.content == '+help') {
    message.reply('No help fo u')
    message.author.send('Real Help is available at https://discord.gg/mx6Gcdb')
    console.log(`${message.author} ${message.author.username} Requested Help...`)
    logchannel.send(`${message.author} ${message.author.username} Requested Help...`)
}
if (message.content == '+inv') {
    message.reply('`Invite me:` http://jt3ch.cf/jacobsux')
    console.log(`${message.author} ${message.author.username} Requested an Invite...`)
    logchannel.send(`${message.author} ${message.author.username} Requested an Invite...`)
} 
if (message.content == '+log') {
    message.reply('Join the log server... https://discord.gg/mx6Gcdb') 
    console.log(`${message.author} ${message.author.username} Requested log server`)
    logchannel.send(`${message.author} ${message.author.username} Requested log server`)
} 
});
//End of Use Commands

bot.on('guildRoleUpdate', (newRole, oldRole) => {
    if (oldRole.name == 'new role') {
    newRole.setName('bad role')
    console.log('k')
    } 
});

//Start of Testing commands...
bot.on('message', message => {

var sender = message.author;
var msg = message.content.toUpperCase();
var prefix = '+'

if (message.content == '+delete')  {
message.delete()
  .then(msg => console.log(`Deleted message from ${msg.author}`))
  message.reply(`Deleted message`)
  .catch(console.error);
		}
		
if (message.content == '+test')  {
    const logchannel = bot.channels.get("399688995283533824")
    logchannel.send("lol");
		}
		});
 //End of Testing Commands
		

bot.login('token');
