/**
 * RegExp which takes an array of uncensored parts to use in .test
 * @extends RegExp
 */
export class JPBExp extends RegExp {
  public uncensor: RegExp[] = []
  public uncensorText: string[] = []

  /**
   * JPBExp
   * @param {String} regex RegEx Statement
   * @param {Array.<String>} uncensor Bits to uncensor
   */
  constructor(public _text: string, uncensor: string[] = []) {
    super(_text)

    uncensor.forEach((x) => this.addUncensor(x))
  }

  addUncensor(text: string) {
    this.uncensor.push(new RegExp(text))
    this.uncensorText.push(text)
  }

  /**
   * Test
   * @param {String} str String to test against
   * @param {?Array.<String>} uncensor Extra uncensors
   * @returns {Boolean} Whether it matches or not
   */
  test(str: string, uncensor: string[] = []): boolean {
    if (!str.match(this)) return false

    if (
      [
        ...this.uncensor,
        ...uncensor.filter((x) => x.match(this)).map((x) => new RegExp(x))
      ].some((x) => str.match(x))
    )
      return false

    return true
  }

  toJSON(): string {
    return this._text
  }
}
