/* global _, api */

window._ = {
  elm (elm, props, attr, children) {
    if (!props) props = {}
    if (!attr) attr = {}
    if (!children) children = []

    if (props.constructor === Array) {
      children = props
      props = {}
    }
    if (attr.constructor === Array) {
      children = attr
      attr = {}
    }

    if (typeof props === 'string') props = { innerText: props }

    elm = document.createElement(elm)

    if (props.classes) {
      props.classes.forEach(c => {
        elm.classList.add(c)
      })
    }

    if (props.events) {
      Object.keys(props.events).forEach(prop => {
        elm.addEventListener(prop, props.events[prop].bind(undefined, elm))
      })
    }

    delete props.classes
    delete props.events

    Object.keys(props).forEach(key => {
      elm[key] = props[key]
    })

    Object.keys(attr).forEach(key => {
      elm.setAttribute(key, attr[key])
    })

    children.forEach(child => {
      elm.appendChild(child)
    })

    return elm
  },
  setRoot (...args) {
    let [elms, root = 'root'] = args
    if (typeof elms === 'string') {
      root = 'root'
      elms = this.elm(...args)
    }
    if (typeof root === 'string') root = document.getElementById(root)

    root.innerHTML = ''
    if (elms.constructor !== Array) elms = [elms]

    elms.forEach(elm => {
      root.appendChild(elm)
    })
  },
  addToAll (query, elm) {
    document.querySelectorAll(query).forEach(node => {
      node.appendChild(elm.cloneNode(true))
    })
  },
  removeAll (query) {
    document.querySelectorAll(query).forEach(elm => {
      elm.parentNode.removeChild(elm)
    })
  },
  preset: {
    login (t, r) {
      _.setRoot(_.elm('button', {
        innerText: `Login ${t || ''}`,
        events: {
          click: () => api.login()
        }
      }), r)
    },
    loading (r) {
      _.setRoot(_.elm('h1', 'Loading...'), r)
    },
    title (name, title) {
      return _.elm('h3', name, { title })
    }
  }
}
