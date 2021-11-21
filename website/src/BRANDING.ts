import Accuracy from './images/accuracy.gif'
import Coverage from './images/coverage.gif'
import Placeholder from './images/placeholder.gif'
import Punishments from './images/punishments.gif'

export default {
  name: 'Censor Bot',
  logo: 'https://static.jpbbots.org/censorbot.svg',
  title: 'The bot that keeps your server clean.',
  title2:
    'Accurately remove any content with premade filters, gone are the days of filling 100s of boxes.',
  mainImage: Placeholder.src,

  examples: [
    {
      title: 'Accuracy',
      description:
        'Censor Bot comes equipped with an advanced text resolution system, which allows for simple words like "test", to be applied to so many possibilities. It doesn\'t matter if the word is separated with spaces, .\'s, made of strange characters, even repeated letters.',
      example: Accuracy.src
    },
    {
      title: 'Coverage',
      description:
        "Censor Bot can cover nearly every bit of content that makes it's way into your server. It covers messages of course, but it also covers reaction, and nicknames, even usernames!",
      example: Coverage.src
    },
    {
      title: 'Customizability',
      description:
        "Pick and choose what kinds of things you want to censor. You can cover all swears, only slurs, or just add your own words, it's all changeable to fit your server and it's needs perfectly.",
      example: Placeholder.src
    },
    {
      title: 'Punishments',
      description:
        'Stop bad actors in their tracks with advanced punishments. Pick and choose how many times a user can swear in a certain amount of time, and if they go over it, choose to give them a role, kick, or ban them.',
      example: Punishments.src
    }
  ] as Array<{ title: string; description: string; example: string }>
}
