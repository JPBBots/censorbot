/* eslint-disable */
require('./u.js')

function uniToDec(string) {
  var output = [],
  counter = 0,
  length = string.length,
  value,
  extra
  while (counter < length) {
    value = string.charCodeAt(counter++)
    if ((value & 0xF800) == 0xD800 && counter < length) {
      extra = string.charCodeAt(counter++)
      if ((extra & 0xFC00) == 0xDC00) {
        output.push({ str: string[counter - 1], val: ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000 })
      } else {
        output.push({ str: string[counter - 1], val: value }, { str: string[counter - 1], val: extra })
      }
    } else {
      output.push({ str: string[counter - 1], val: value })
    }
  }
  return output
}

module.exports = (string) => {
  const decked = uniToDec(string)
  let res = ""

  for (let i = 0; i < decked.length; i++) {
	const { str, val } = decked[i]
	if (!str.match(/[^\x00-\x7F]+/)) {
	  res += str
	  continue
	}

	res += U[val].split(';')[1].slice(-1)
  }
  return res
}