/* global XMLHttpRequest, showToast, hideChangeBar, Event, Tagify */

class Base { // eslint-disable-line no-unused-vars
  constructor (settings, useBar = false, addMissingTags = false) {
    delete settings.id

    this.settings = settings
    this.addMissingTags = addMissingTags
    this.useBar = useBar

    this.ready = false

    this.tags = new Map()

    this._setup()
  }

  _setup () {
    window.addEventListener('load', () => {
      this.insert(this.settings)

      window.lib.ready = true
      window.lib.update()
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        console.log('got ctrl+s')
        this.post()
      }
    })

    if (this.useBar) {
      setInterval(() => {
        this.update()
      }, 2000)
    }
  }

  tell (msg) {
    showToast(msg)
  }

  update () {
    if (!this.ready || !this.useBar) return
    if (this.changed) window.showChangeBar()
    else window.hideChangeBar()
  }

  addTag (tagName, options) {
    const tag = new Tagify(this._getElm(tagName), options)
    tag.on('add', this.update.bind(this))
    tag.on('remove', this.update.bind(this))
    this.tags.set(tagName, tag)
  }

  clearTags (tag) {
    this.tags.get(tag).removeAllTags()
    this.update()
  }

  _isEqual (obj1, obj2) {
    let res = true
    Object.keys(obj1).forEach(key => {
      if (obj1[key] && obj1[key].constructor === Array) {
        if (obj1[key].some(a => !obj2[key].some(b => a === b)) || obj2[key].some(a => !obj1[key].some(b => a === b))) res = false
        return
      }
      if (obj1[key] !== obj2[key]) res = false
    })
    return res
  }

  _getElm (id) {
    if (!id) return document.querySelectorAll('[setting]')
    return document.querySelector(`[setting=${id}]`.replace(/\./, '\\.'))
  }

  _typer (set, elm, value, keyed) {
    let res
    switch (elm.getAttribute('typed')) {
      case 'boolean':
        set ? (elm.checked = value) : (res = elm.checked)
        break
      case 'list':
        set
          ? (elm.value = value || 'null')
          : (res = elm.value === 'null' ? null : elm.value)
        break
      case 'tagArray':
        if (set) {
          var tag = this.tags.get(keyed)
          tag.removeAllTags()
          if (tag.settings.whitelist.length > 0) {
            tag.settings.whitelist.filter(x => value.includes(x.id)).forEach(x => tag.addTags(x.value))
            if (this.addMissingTags) value.filter(x => !tag.settings.whitelist.some(b => b.id === x)).forEach(x => tag.addTags(x))
          } else {
            value.forEach(x => tag.addTags(x))
          }
        } else {
          res = elm.value ? JSON.parse(elm.value).map(x => x.id || x.value) : []
        }
        break
      case 'time':
        set
          ? (elm.value = value / 1000)
          : (res = elm.value === ''
            ? null
            : elm.value * 1000)
        break
      case 'message':
        set
          ? (elm.value =
              value === false ? 'Off'
                : value === null ? 'Default'
                  : value)
          : (res =
              elm.value === 'Off' ? false
                : elm.value === 'Default' ? null
                  : elm.value)
        break
      case 'typeNum':
        set
          ? (elm.value = String(value))
          : (res = Number(elm.value))
        break
      case 'none':
        set
          ? (elm.value = value)
          : (res = elm.value === '' ? null : elm.value)
        break
      default:
        set
          ? (elm.value = value)
          : (res = elm.value)
        break
    }
    return res
  }

  create () {
    const res = {}
    const settings = this._getElm()
    const add = (obj, addTo, part) => {
      const prop = part || obj.getAttribute('setting')
      if (prop.includes('.')) {
        const split = prop.split('.')
        const piece = split.shift()
        if (!addTo[piece]) addTo[piece] = {}
        add(obj, addTo[piece], split.join('.'))
      } else {
        addTo[prop] = this._typer(false, obj)
      }
    }
    settings.forEach(elm => add(elm, res))
    return res
  }

  _flatten (obj) {
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
    return res
  }

  get changed () {
    return !this._isEqual(this._flatten(this.settings), this._flatten(this.create()))
  }

  insert (obj) {
    console.log('Inserting object')
    const res = this._flatten(obj)
    for (var key in res) {
      var elm = document.querySelector(`[setting=${key}]`.replace(/\./, '\\.'))
      if (!elm) {
        console.log(`${key} : ${res[key]}`)
        continue
      }
      this._typer(true, elm, res[key], key)
      elm.dispatchEvent(new Event('change'))
    }
  }

  post () {
    if (this.useBar) document.querySelector('.saveButton').innerText = 'Saving...'
    var xhr = new XMLHttpRequest()
    xhr.open('POST', window.location.href)
    xhr.onload = () => {
      var response = JSON.parse(xhr.response)
      if (response.error) return this.tell('Error: ' + response.error)
      if (this.useBar) document.querySelector('.saveButton').innerText = 'Save Changes'
      this.settings = response
      this.insert(response)
    }
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(this.create()))
  }

  reset () {
    console.log('Resetting')
    this.insert(this.settings)
    hideChangeBar()
  }
}
