/**
 * global BigInt
 */

module.exports = (guild, amount) => {
  let shard
  try {
    shard = Number((BigInt(guild) >> BigInt(22)) % BigInt(amount))
  } catch (e) {
    return 0
  }
  return shard
}
