const fetch = require('node-fetch')

module.exports = (id, avatar, discrim = 1) => {
  return new Promise(resolve => {
    fetch(`https://cdn.discordapp.com/${!avatar ? 'embed/' : ''}avatars/${!avatar ? discrim % 5 : `${id}/${avatar}`}.png`)
      .then(x => x.buffer())
      .then(x => resolve(`data:image/png;base64,${x.toString('base64')}`))
  })
}
