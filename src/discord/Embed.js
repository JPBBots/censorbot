// stole from discord.js
const Colors = {
  DEFAULT: 0x000000,
  WHITE: 0xFFFFFF,
  AQUA: 0x1ABC9C,
  GREEN: 0x2ECC71,
  BLUE: 0x3498DB,
  YELLOW: 0xFFFF00,
  PURPLE: 0x9B59B6,
  LUMINOUS_VIVID_PINK: 0xE91E63,
  GOLD: 0xF1C40F,
  ORANGE: 0xE67E22,
  RED: 0xE74C3C,
  GREY: 0x95A5A6,
  NAVY: 0x34495E,
  DARK_AQUA: 0x11806A,
  DARK_GREEN: 0x1F8B4C,
  DARK_BLUE: 0x206694,
  DARK_PURPLE: 0x71368A,
  DARK_VIVID_PINK: 0xAD1457,
  DARK_GOLD: 0xC27C0E,
  DARK_ORANGE: 0xA84300,
  DARK_RED: 0x992D22,
  DARK_GREY: 0x979C9F,
  DARKER_GREY: 0x7F8C8D,
  LIGHT_GREY: 0xBCC0C0,
  DARK_NAVY: 0x2C3E50,
  BLURPLE: 0x7289DA,
  GREYPLE: 0x99AAB5,
  DARK_BUT_NOT_BLACK: 0x2C2F33,
  NOT_QUITE_BLACK: 0x23272A
}
// no longer stolen

/**
 * Embed object
 */
class Embed {
  /**
   * Creates Embed instance
   * @param {?Function} sendback Function if send() is used
   */
  constructor (sendback) {
    /**
     * Embed object
     */
    this.obj = {
      title: null,
      description: null,
      url: null,
      timestamp: null,
      color: Colors.DEFAULT,
      fields: [],

      thumbnail: null,
      footer: null,
      image: null,
      author: null
    }

    this.sendback = sendback
  }

  /**
   * Sets embeds description
   * @param {String} desc Description
   * @returns {Embed} This embed instance
   */
  description (desc) {
    this.obj.description = desc
    return this
  }

  /**
   * Sets embed title
   * @param {String} title Title
   * @param {String} url URL to set
   * @returns {Embed} This embed instance
   */
  title (title, url) {
    this.obj.title = title
    this.obj.url = url || null
    return this
  }

  /**
   * Sets timestamp
   * @param {Date} date Date to set timestamp too
   * @returns {Embed} This embed instance
   */
  timestamp (date = new Date()) {
    this.obj.timestamp = date.toISOString()
    return this
  }

  /**
   * Sets embed color
   * @param {Number|String} Color
   * @returns {Embed} This embed instance
   */
  color (color) {
    if (Colors[color]) color = Colors[color]
    if (color instanceof String) color = Number(color)
    this.obj.color = color
    return this
  }

  /**
   * Adds a field
   * @param {String} name Name of field
   * @param {String} value Value of field
   * @param {Boolean} inline Whether field is inline
   * @returns {Embed} This embed instance
   */
  field (name, value, inline) {
    this.obj.fields.push({
      name: name,
      value: value,
      inline: inline
    })
    return this
  }

  /**
   * Sets thumbnail
   * @param {String} url URL of thumbnail
   * @param {Number} width Width
   * @param {Number} height Height
   * @returns {Embed} This embed instance
   */
  thumbnail (url, width, height) {
    this.obj.thumbnail = {
      url: url,
      width: width || null,
      height: height || null
    }
    return this
  }

  /**
   * Sets footer
   * @param {String} text Footer text
   * @param {String} icon URL of icon
   * @returns {Embed} This embed instance
   */
  footer (text, icon) {
    this.obj.footer = {
      text: text || null,
      icon_url: icon || null
    }
    return this
  }

  /**
   * Sets image
   * @param {String} url URL of image
   * @param {Number} width Width
   * @param {Number} height Height
   * @returns {Embed} This embed instance
   */
  image (url, width, height) {
    this.obj.image = {
      url: url,
      width: width || null,
      height: height || null
    }
    return this
  }

  /**
   * Sets author
   * @param {String} name Name of author
   * @param {String} icon URL of icon
   * @param {String} url URL link on author
   * @returns {Embed} This embed instance
   */
  author (name, icon, url) {
    this.obj.author = {
      name: name,
      icon_url: icon,
      url: url
    }
    return this
  }

  /**
   * Renders embed
   * @returns {Object}
   */
  render () {
    return this.obj
  }

  /**
   * Sends back
   * @param {Snowflake} id ID to sendback
   */
  send (id) {
    return this.sendback(this, id)
  }
}

module.exports = Embed
