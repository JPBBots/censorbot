class Internals {
  constructor (client) {
    this.client = client
  }

  logCensor (type, content, user, guild, res) {
    this.client.log(6, 13, `${type}; ${content}`, `${user.username}#${user.discriminator};${user.id};${res.method}`)
    this.client.webhooks.send('log', {
      content: `\`\`\`${content.replace(/`/g, '\'')}\`\`\``,
      embeds: [
        this.client.embed
          .title(type)
          .description(`<@${user.id}>(${user.id}) in ${guild}`)
          .field('Method', res.method)
          .field('Arg', res.arg.map(x => x.toString()).join(', '))
          .render()
      ]
    })
  }
}

module.exports = Internals
