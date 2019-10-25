exports.run = async (client, message, args, db) => {
  message.delete()
  var aaa = await db.get('msg')
  if (aaa === false) return client.sendErr(message, 'Message is already off!')
  var res = await client.sendSettings(message, ['Message Reply', aaa ? 'Default' : aaa, 'OFF'], ['Removed filter message!', 'Filter message removed by ' + message.author.username])
	    if (res == 200) return db.set('msg', false)
	    else return console.log('Error: ' + res)
}
exports.info = {
  name: 'delmsg',
  description: 'Removes the filter message completely (No reply when someone curses)',
  format: '{prefix}'
}
