const Embed = require('../discord/Embed')

module.exports = (content, webhook = false) => {
  const bit = typeof content === 'string' ? { content: content }
    : content instanceof Embed
      ? webhook ? {
        embeds: [content.render()]
      } : {
        embed: content.render()
      }
      : content

  if (!bit.content) bit.content = ''
  return bit
}
