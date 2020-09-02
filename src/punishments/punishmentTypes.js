/**
 * Used to decide which kind of punishment to execute in a given server
 * @typedef {Number} PunishmentType
 * @example
 * 0: Off
 * 1: Mute
 * 2: Kick
 * 3: Ban
 */

const punishmentType = {
  0: false,
  1: 'mute',
  2: 'kick',
  3: 'ban'
}

const unpunishmentType = {
  0: false,
  1: 'unmute',
  2: null,
  3: 'unban'
}

module.exports = { punishmentType, unpunishmentType }
