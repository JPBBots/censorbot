import { CommandOptions } from 'discord-rose'

export default {
  command: 'credits',
  aliases: ['creds'],
  interaction: {
    name: 'credits',
    description: 'Displays Censor Bot\'s Developers and Contributers'
  },
  description: 'Displays Censor Bot\'s Developers and Contributers',
  exec: (ctx) => {
    void ctx.embed
      .title('Credits')
      .field('__**Developers**__',
        '**Head Developer**: [JPBBerry](https://jt3ch.net)\n' +
      '**Web Developer**: [Bowser](https://dev.jazzmoon.ca)\n' +
      '**Website Engineer**: Uber\n' +
      '**Icon Art**: higbead#0871\n' +
      '**Moral Support**: [Peter2469](https://www.peternokes.co.uk)\n'
      )
      .field('__**Support Team**__',
        '_Darkell#1866, Egyptian_Lobster#9080, nevy#4883, R0SE#2908'
      )
      .field('__**Translators**__',
        '**English**: Literally everyone\n' +
      '**Spanish**: JPBBerry#0001\n' +
      '**German**: Durotan#5649\n' +
      '**Russian**: shivaco#0542'
      )
      .send()
  }
} as CommandOptions
