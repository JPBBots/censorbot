export function generateGuildIcon (name: string, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const text = name
    .split(' ')
    .map(e => e[0])
    .join('')

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  ctx.fillStyle = '#36393f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = `${(canvas.height / 2) - (10 * text.length)}px Arial`

  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
}
