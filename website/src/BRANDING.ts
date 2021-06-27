import Example1 from './images/example1.gif'

const PLACEHOLDER = 'hello '.repeat(150)

export default {
  name: 'Censor Bot',
  logo: 'https://static.jpbbots.org/censorbot.svg',
  title: 'The bot that keeps your server clean.',
  title2: 'Accurately remove any content with premade filters, gone are the days of filling 100s of boxes.',

  examples: [
    {
      title: 'Accuracy',
      description: PLACEHOLDER,
      example: Example1.src
    },
    {
      title: 'Coverage',
      description: PLACEHOLDER,
      example: Example1.src
    },
    {
      title: 'Customizability',
      description: PLACEHOLDER,
      example: Example1.src
    }
  ] as Array<{ title: string, description: string, example: string }>
}
