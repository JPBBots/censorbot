exports.run = function (message, args) {
  if (!args[0]) return this.send(
    this.embed
      .title('Tickets')
      .description(`For when words shouldn't be censored by the base filter, but they are.\n\nFormat: \`${this.client.config.prefix[0]}ticket [word / phrase]\``)
  )
  this.client.tickets.add(args.join(' '), message.author.id)
    .then(() => {
      this.send(
        this.embed
          .title('Ticket Submitted')
          .description('These take time! You\'ll be notified via DMs regarding our decision!')
      )
    })
    .catch(err => {
      this.send(
        this.embed
          .title('Error Creating Ticket')
          .description(`${err.message}`)
      )
    })
}

exports.info = {
  name: 'ticket',
  usage: '{prefix}ticket [word/phrase]',
  description: 'Submits a ticket for when words shouldn\'t be censored',
  aliases: []
}
