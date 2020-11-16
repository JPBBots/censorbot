exports.run = function (message, args) {
  this.send(
    this.embed
      .description('Give Censor Bot a review [here](https://censor.bot/review)!\nPlease do not review because you\'ve had an issue, join the support server first and ask for help! (+support)')
  )
}
exports.info = {
  name: 'review',
  description: 'Gives link to review the bot',
  format: '{prefix}review',
  aliases: ['reviews']
}
