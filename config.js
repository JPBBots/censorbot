delete require.cache[require.resolve("./secret-config.js")]
delete require.cache[require.resolve("./public-config.js")]

module.exports = {
  ...require("./secret-config.js"),
  ...require("./public-config.js")
}