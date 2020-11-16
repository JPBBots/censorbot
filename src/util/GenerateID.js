/**
 * Small 3 letter unique ID
 * @typedef {String} SmallID
 */

module.exports = (notallow = []) => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 3; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  if (notallow.includes(text)) return module.exports(notallow)

  return text
}
