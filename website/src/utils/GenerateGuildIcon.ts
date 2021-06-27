export function generateGuildIcon (name: string, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const canvasHeight = canvas.height
  const canvasWidth = canvas.width

  const nameArr = name.split(' ')
  const letterArr = nameArr.map(e => e[0])
  const text = letterArr.join('')

  const height = (canvasHeight / 2) - (10 * text.length)

  ctx.fillStyle = '#36393f'
  ctx.fillRect(0, 0, canvasHeight, canvasWidth)

  ctx.fillStyle = 'white'
  ctx.font = `${height}px Arial`

  ctx.fillText(
    text,
    (canvasHeight - ctx.measureText(text).width) / 2,
    (canvasHeight / 2) - (canvasHeight / 15) + (height / 2)
  )
}
