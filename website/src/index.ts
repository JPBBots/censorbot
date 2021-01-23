import 'regenerator-runtime/runtime.js'

import { Loader } from './Loader'

import './typings/dom'
import './typings/api'

window.onload = async () => {
  if (new URLSearchParams(window.location.search).get('dev') === 'true') window.dev = true

  window.__LOADER = new Loader()

  if (window.dev) {
    const script = document.createElement('script')
          script.src = '/static/dev.js'
    document.head.appendChild(script)
  } else {
    (document.querySelector('nav > h3') as HTMLElement).oncontextmenu = (event) => {
      if (event.ctrlKey) {
        event.preventDefault()
        if (!confirm('This will enable development mode, are you sure? Press OK to continue.')) return
        window.location.search = '?dev=true'
      }
    }
  }
}