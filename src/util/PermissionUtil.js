module.exports = {
  /**
   * Calculate if user has perms
   * @param {Number} perms User perms
   * @param {Number} has Required perms
   * @returns {Boolean}
   */
  hasPerms (perms, has) {
    if ((perms & 0x000008) !== 0) return true // admin
    if ((perms & has) !== 0) return true // has perms
  }
}
