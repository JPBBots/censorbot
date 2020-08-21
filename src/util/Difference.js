function differences (obj, newObj, current = '') {
  const keys = Object.keys(obj)
  let dif = []
  keys.forEach((key) => {
    if (newObj[key] instanceof Array && obj[key] instanceof Array && newObj[key].length !== obj[key].length) return dif.push(current + (current ? '.' : '') + key)
    if (newObj[key] instanceof Array || (newObj[key] && newObj[key].constructor === Object)) {
      const di = differences(obj[key], newObj[key], current + (current ? '.' : '') + key)
      if (di.length > 0 && newObj[key] instanceof Array) return dif.push(current + (current ? '.' : '') + key)
      dif = dif.concat(di)
      return
    }
    if (newObj[key] !== obj[key]) dif.push(current + (current ? '.' : '') + key)
  })
  return dif
}

module.exports = differences
