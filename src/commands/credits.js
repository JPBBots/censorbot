exports.run = function (message, args) {
  this.send(
    this.embed
      .title('Credits')
      .field('Head Developer', 'JPBBerry#0742' + ' : [Twitter](https://twitter.com/jpbberry) - [Instagram](https://instagram.com/jpbberry) ')
      .field('Icon Art', 'higbead#0871')
      .field('Translators', 'English: Literally everyone\nSpanish: JPBBerry#0742\nPolish: Marcel#0473')
  )
}
exports.info = {
  name: 'credits',
  description: "Displays {name}'s Developers and contributers",
  format: '{prefix}credits',
  aliases: ['creds']
}
