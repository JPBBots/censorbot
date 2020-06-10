exports.run = function (message, args) {
  switch (args[0]) {
    case 'set':
      this.client.presence.setCustom(undefined, args.slice(1).join(' '), undefined)
      this.send(':ok_hand:')
      break
    default:
      this.client.presence.set(args[0])
      this.send(':ok_hand:')
      break
  }
}

exports.info = {
  name: 'presence',
  description: 'Controls presence',
  aliases: [],
  admin: true
}
