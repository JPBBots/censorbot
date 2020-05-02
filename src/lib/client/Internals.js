/**
 * Used for methods that should be accessible from everywhere throughout censor bot
 */
class Internals {
  /**
   * Internal Methods
   * @param {Client} client Client
   */
  constructor (client) {
    /**
     * Client
     * @type {Client}
     */
    this.client = client
  }

  /**
   * Log a censor
   * @param {String} type Type
   * @param {String} content Content
   * @param {Object} user User
   * @param {Snowflake} guild Guild
   * @param {Object} res Filter response
   */
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

  /**
   * Formatted guild counts
   * @type {Array.<Number>}
   */
  get formatted () {
    return this.client.guilds.reduce((a, b) => {
      a[this.client.options.shards.indexOf(this.client.guildShard(b.id))]++
      return a
    }, this.client.shards.reduce((a) => a.concat([0]), []))
  }
}

module.exports = Internals
