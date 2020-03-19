function isEquivalent (a, b) {
  var aProps = Object.getOwnPropertyNames(a)
  var bProps = Object.getOwnPropertyNames(b)
  if (!bProps || !aProps) return false
  if (aProps.length != bProps.length) {
    return false
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i]
    if (typeof a[propName] === 'object' && a[propName] !== null) {
      if (!isEquivalent(a[propName], b[propName])) return false
    } else if (a[propName] !== b[propName]) {
      return false
    }
  }
  return true
}

function fileContents (file, cb) {
  var reader = new FileReader()
  reader.onload = function () {
    cb(
      new TextDecoder('utf-8')
        .decode(
          new Uint8Array(this.result)
        )
    )
  }
  reader.readAsArrayBuffer(file)
}

function download (filename, text) {
  var element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}
