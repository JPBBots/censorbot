module.exports = (element, key, list) => {
  list = list || []
  if (typeof (element) === 'object') {
    for (var idx in element) { module.exports(element[idx], key ? key + '[' + idx + ']' : idx, list) }
  } else {
    list.push(key + '=' + encodeURIComponent(element))
  }
  return list.join('&')
}
