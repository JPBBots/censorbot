/**
 * Small 3 letter unique ID
 * @typedef {String} SmallID
 */

module.exports = (notallow = []) => {
  var text = ''
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 3; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  if (notallow.includes(text)) return module.exports(notallow)

  return text
}
