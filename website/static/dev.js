console.log('DEV MODE ON')

function addButton (name, fn) {
  const a = document.createElement('a')
        a.innerText = name
        a.onclick = typeof fn === 'string' ? () => __LOADER.util.setPath(fn) : fn

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
addButton('Admin Page', '/admin')

addButton('Normal Login', differentLogin(null))
addButton('Login With Canary', differentLogin('/canary'))
addButton('Login With PTB', differentLogin('/ptb'))

addButton('Disable DEV mode', () => window.location.search = '')