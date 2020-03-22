const Embed = require('./Embed')

module.exports = (content) => {
  return typeof content === 'string' ? { content: content }
    : content instanceof Embed
      ? {
        embed: content.render()
      }
      : content
}
