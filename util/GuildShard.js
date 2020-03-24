/**
 * global BigInt
 */
module.exports = (guild, amount) => {
  const guildID = String(guild)
  let shard
  for (let i = 0; i < amount; i++) {
    if ((BigInt(guildID) >> BigInt(22)) % BigInt(amount) === i) { shard = i; break }
  }
  return shard
}
