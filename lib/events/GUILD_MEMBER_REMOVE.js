module.exports = function (event) {
  this.removeUserGuild(event.user.id, event.guild_id)
}
