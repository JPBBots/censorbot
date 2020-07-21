/**
 * RegExp which takes an array of uncensored parts to use in .test
 * @extends RegExp
 */
class JPBExp extends RegExp {
  /**
   * JPBExp
   * @param {String} regex RegEx Statement
   * @param {Array.<String>} uncensor Bits to uncensor
   */
  constructor (regex, uncensor = []) {
    super(regex)

    this.uncensor = uncensor.map(x => new RegExp(x))
  }

  /**
   * Test
   * @param {String} str String to test against
   * @param {?Array.<String>} uncensor Extra uncensors
   * @returns {Boolean} Whether it matches or not
   */
  test (str, uncensor = []) {
    if (!str.match(this)) return false

    if ([...this.uncensor,
      ...uncensor.filter(x => x.match(this)).map(x => new RegExp(x))]
      .some(x => str.match(x))) return false

    return true
  }

  toJSON () {
    return this.toString()
  }
}

module.exports = JPBExp
