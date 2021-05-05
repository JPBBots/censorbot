import 'regenerator-runtime/runtime.js'
import * as smoothscroll from 'smoothscroll-polyfill'

smoothscroll.polyfill()

import { Loader } from './Loader'

import { Admin } from './loaders/Admin'
import { Staging } from './loaders/Staging'
import { Chargebee } from './loaders/Chargebee'

import './typings/dom'

window.loadTime = 100

window.onload = async () => {
  if (new URLSearchParams(window.location.search).get('dev') === 'true') window.dev = true

  const loader = new Loader()
  window.__LOADER = loader

  Admin(loader)
  Staging(loader)
  Chargebee(loader)
}
