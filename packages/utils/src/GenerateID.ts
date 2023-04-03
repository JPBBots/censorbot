import { ShortID } from '@censorbot/typings'

export function generateShortId(notAllow: string[] = []): ShortID {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 3; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  if (notAllow.includes(text)) return generateShortId(notAllow)

  return text
}
