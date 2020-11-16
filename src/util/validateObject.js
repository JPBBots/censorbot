function valid (ref, obj) {
  let res = true
  if (!obj) return false
  const refKeys = Object.keys(ref)
  const objKeys = Object.keys(obj)

  if (objKeys.some(x => !refKeys.includes(x))) return false

  for (let i = 0; i < refKeys.length; i++) {
    const key = refKeys[i]
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      res = false
      break
    }
    if ((!!ref[key]) && (ref[key].constructor === Object)) {
      const result = valid(ref[key], obj[key])
      if (!result) {
        res = false
        break
      }
    }
  }

  return res
}

module.exports = valid
