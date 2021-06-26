import Example1 from './images/example1.gif'

const PLACEHOLDER = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eu nisl nunc mi ipsum faucibus vitae aliquet. Vestibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt. Malesuada proin libero nunc consequat interdum. Aliquam faucibus purus in massa tempor nec feugiat. Volutpat diam ut venenatis tellus. Turpis tincidunt id aliquet risus feugiat. Tincidunt augue interdum velit euismod in. Lacus sed viverra tellus in hac habitasse platea. A lacus vestibulum sed arcu non. Interdum velit euismod in pellentesque massa placerat duis ultricies.'

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
