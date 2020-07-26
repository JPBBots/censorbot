exports.run = function (message, args) {
  this.send(
    this.embed
      .title('Credits')
      .field('Head Developer', '[JPBBerry](https://jt3ch.net)', true)
      .field('Icon Art', 'higbead#0871', true)
      .field('Head Helper', 'Limit', true)
      .field('Translators', 
        'English: Literally everyone\n' +
        'Spanish: JPBBerry#0001\n' +
        'German: Durotan#5649\n' +
        'Russian: shivaco#0542', 
      true)
  )
}
exports.info = {
  name: 'credits',
  description: "Displays {name}'s Developers and contributers",
  format: '{prefix}credits',
  aliases: ['creds']
}
