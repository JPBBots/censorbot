exports.run = function (message, args) {
  this.send(
    this.embed
      .title('Credits')
      .field('Head Developer', '[JPBBerry](https://jt3ch.net)', true)
      .field('Dashboard Designer', '[Bowser](https://dev.jazzmoon.ca)', true)
      .field('Icon Art', 'higbead#0871', true)
      .field('Translators', 'English: Literally everyone\nSpanish: JPBBerry#0742\nPolish: Marcel#0473', true)
  )
}
exports.info = {
  name: 'credits',
  description: "Displays {name}'s Developers and contributers",
  format: '{prefix}credits',
  aliases: ['creds']
}
