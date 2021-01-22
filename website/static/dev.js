console.log('DEV MODE ON')

function addButton (name, fn, admin) {
  const a = document.createElement('a')
        a.innerText = name
        a.onclick = typeof fn === 'string' ? () => __LOADER.util.setPath(fn) : fn

  if (admin) {
    a.setAttribute('hidden', '')
    a.classList.add('adminshow')
  }

  document.getElementById('menu').appendChild(a)
}

addButton('Toast', () => LOGGER.tell('This is a test of the screen toast'))
addButton('Present Load', () => {
  const div = document.createElement('div')
        div.innerText = 'This is a test of the Utils.presentLoad'
        div.appendChild(document.createElement('br'))
  const button = document.createElement('button')
        button.classList.add('button')
        button.onclick = () => window.__LOADER.util.stopLoad()

  div.appendChild(button)

  window.__LOADER.util.presentLoad(div)
})
addButton('Reload Page', () => window.__LOADER.util.reloadPage())
const differentLogin = (type) => {
  return () => {
    window.discordOAuthExtra = type
    __LOADER.api.logout().then(() => __LOADER.api.auth())
  }
}

addButton('Normal Login', differentLogin(null))
addButton('Login With Canary', differentLogin('/canary'))
addButton('Login With PTB', differentLogin('/ptb'))

addButton('Rebuild Site', () => {
  window.__LOADER.util.presentLoad('Rebuilding site')
  fetch('/', { method: 'DELETE' }).then(() => location.reload())
}, true)

addButton('Disable DEV mode', () => window.location.search = '')