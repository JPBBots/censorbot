module.exports = (element, key, list) => {
  list = list || []
  if (typeof (element) === 'object') {
    for (const idx in element) { module.exports(element[idx], key ? key + '[' + idx + ']' : idx, list) }
  } else if (element !== null) {
    list.push(key + '=' + encodeURIComponent(element))
  }
  return list.join('&')
}
