exports.run = function (message, args) {
  this.send(
    this.embed
      .title('Credits')
      .field('__**Developers**__',
        '**Head Developer**: [JPBBerry](https://jt3ch.net)\n' +
        '**Web Developer**: [Bowser](https://dev.jazzmoon.ca)\n' +
        '**Website Engineer**: Uber\n' +
        '**Icon Art**: higbead#0871\n' +
        '**Moral Support**: [Peter2469](https://www.peternokes.co.uk)\n'
      )
      .field('__**Support Team**__',
        '<@467593308839870475>, <@601784957664493608>, <507444005030854656>'
      )
      .field('__**Translators**__',
        '**English**: Literally everyone\n' +
        '**Spanish**: JPBBerry#0001\n' +
        '**German**: Durotan#5649\n' +
        '**Russian**: shivaco#0542'
      )
  )
}
exports.info = {
  name: 'credits',
  description: "Displays {name}'s Developers and contributers",
  format: '{prefix}credits',
  aliases: ['creds']
}
