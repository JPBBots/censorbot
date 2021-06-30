export function updateObject (obj: any, ..._: any[]): any {
  for (let i = 1; i < arguments.length; i++) {
    for (const prop in arguments[i]) {
      const val = arguments[i][prop]
      if (obj[prop] === undefined) {
        obj[prop] = val
      } else if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
        updateObject(obj[prop], val)
      } else {
        obj[prop] = val
      }
    }
  }
  return obj
}
