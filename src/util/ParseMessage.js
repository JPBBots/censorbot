const Embed = require('../discord/Embed')

module.exports = (content, webhook = false) => {
  return typeof content === 'string' ? { content: content }
    : content instanceof Embed
      ? webhook ? {
        embeds: [content.render()]
      } : {
        embed: content.render()
      }
      : content
}
