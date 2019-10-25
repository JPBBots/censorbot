const { WebhookClient } = require('discord.js')

module.exports = (client) => {
  return {
    log: new WebhookClient(client.config.webhooks.log.id, client.config.webhooks.log.token),
    joinAndLeave: new WebhookClient(client.config.webhooks.joinAndLeave.id, client.config.webhooks.joinAndLeave.token),
    dms: new WebhookClient(client.config.webhooks.dms.id, client.config.webhooks.dms.token)
  }
}
