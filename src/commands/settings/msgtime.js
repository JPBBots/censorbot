exports.run = async (client, message, args, db) => {
  message.delete()
  const arg1 = args[0]
  if (!arg1) {
    return client.sendErr(message, 'Correct format: +msgtime `new time in seconds` OR +msgtime `none` to disable deleting.')
  }
  var popt = await db.get('pop_delete')
  var s1 = 's'
  if (popt instanceof Number) {
    if (popt / 1000 == 1) s1 = ''
    popt = (popt / 1000).toString() + ` second${s1}`
  } else popt = 'none'
  if (arg1 == 'none') {
    var res = await client.sendSettings(message, ['Message Pop Time', popt, 'none'], ['Successfully set new pop message time to `none`', 'Command ran by ' + message.author.username])
    if (res == 200) return db.set('pop_delete', null)
    else return console.log('Error: ' + res)
  }
  const v = Number(arg1)
  if (isNaN(v)) {
    return client.sendErr(message, 'Time must be a number in seconds!')
  }
  var s = 's'
  if (v == 1) s = ''
  var res = await client.sendSettings(message, ['Message Pop Time', popt, `${v} second${s}`], ['Successfully set new pop message time to ' + v.toString() + ' seconds!', 'Command ran by ' + message.author.username])
  if (res == 200) return db.set('pop_delete', v * 1000)
  else return console.log('Error: ' + res)
}
exports.info = {
  name: 'msgtime',
  description: 'Sets/Removes the time for pop messages',
  format: '{prefix}msgtime <new_time>'
}
