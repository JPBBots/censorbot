/* eslint-disable no-unused-vars, no-undef */

function create () {
  const res = {}
  const settings = document.querySelectorAll('[setting]')
  function add (obj, addTo, part) {
    const prop = part || obj.getAttribute('setting')
    if (prop.includes('.')) {
      const split = prop.split('.')
      const piece = split.shift()
      if (!addTo[piece]) addTo[piece] = {}
      add(obj, addTo[piece], split.join('.'))
    } else {
      let setTo
      switch (obj.getAttribute('typed')) {
        case 'boolean':
          setTo = obj.checked
          break
        case 'list':
          setTo = obj.value === 'null' ? null : obj.value
          break
        case 'tagArray':
          if (!obj.value) setTo = []
          else setTo = JSON.parse(obj.value).map(x => x.id || x.value)
          break
        case 'time':
          if (obj.value === '') setTo = null
          else setTo = obj.value * 1000
          break
        case 'message':
          if (obj.value === 'Off') setTo = false
          else if (obj.value === 'Default') setTo = null
          else setTo = obj.value
          break
        case 'typeNum':
          setTo = Number(obj.value)
          break
        case 'none':
          if (obj.value === '') setTo = null
          else setTo = obj.value
          break
        default:
          setTo = obj.value
          break
      }
      addTo[prop] = setTo
    }
  }
  settings.forEach(elm => add(elm, res))
  return res
}
function insert (obj) {
  var res = {}
  function generatePiece (toObj, key, working) {
    var val = key ? toObj[key] : toObj
    if (!val || val.constructor !== Object) {
      res[`${working ? `${working}.` : ''}${key}`] = val
    } else {
      Object.keys(val).forEach(x => generatePiece(val, x, `${working ? `${working}.` : ''}${key}`))
    }
  }
  generatePiece(obj, '')
  console.log('Inserting object')
  for (var key in res) {
    var elm = document.querySelector(`[setting=${key}]`.replace(/\./, '\\.'))
    if (!elm) {
      console.log(`${key} : ${res[key]}`)
      continue
    }
    switch (elm.getAttribute('typed')) {
      case 'boolean':
        elm.checked = res[key]
        break
      case 'list':
        elm.value = res[key] ? res[key] : 'null'
        break
      case 'tagArray':
        var tag = window.tags.get(key)
        tag.removeAllTags()
        if (tag.settings.whitelist.length > 0) {
          tag.settings.whitelist.filter(x => res[key].includes(x.id)).forEach(x => tag.addTags(x.value))
          if (window.addMissingTags) res[key].filter(x => !tag.settings.whitelist.some(b => b.id === x)).forEach(x => tag.addTags(x))
        } else {
          res[key].forEach(x => tag.addTags(x))
        }
        break
      case 'time':
        elm.value = res[key] / 1000
        break
      case 'message':
        if (res[key] === false) elm.value = 'Off'
        else if (res[key] === null) elm.value = 'Default'
        else elm.value = res[key]
        break
      case 'typeNum':
        elm.value = String(res[key])
        break
      default:
        elm.value = res[key]
        break
    }
    elm.dispatchEvent(new Event('change'))
  }
}

function post () {
  hideChangeBar()
  var xhr = new XMLHttpRequest()
  xhr.open('POST', window.location.href)
  xhr.onload = function () {
    var response = JSON.parse(xhr.response)
    if (response.error) return alert('Error: ' + response.error)
    window.settings = response
    insert(response)
  }
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(create()))
}

function reset () {
  console.log('Resetting')
  insert(window.settings)
}

document.onkeydown = function (e) {
  if (e.key === 's' && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
    e.preventDefault()
    console.log('got ctrl+s')
    post()
  }
}
