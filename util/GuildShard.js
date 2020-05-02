/**
 * global BigInt
 */
module.exports = (guild, amount) => {
  let shard
  try {
    const guildID = String(guild)
    for (let i = 0; i < amount; i++) {
      if ((BigInt(guildID) >> BigInt(22)) % BigInt(amount) == i) { shard = i; break } // eslint-disable-line eqeqeq
    }
  } catch (err) {
    return 0
  }
  return shard
}
