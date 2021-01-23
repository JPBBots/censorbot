const Express = require('express')
const Path = require('path')
const fetch = require('node-fetch')

const { exec } = require('child_process')

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

const app = Express()

app.use('/static', Express.static(Path.resolve(__dirname, './static')))

app.get('/web.json', (req, res) => {
  res.sendFile(Path.resolve(__dirname, './src', 'web.json'))
})

app.delete('/', (req, res) => {
  sh('npm run buildsite').then(() => res.send('e'))
})

app.get('/support', (req, res) => {
  res.redirect('https://discord.gg/v3r2rKP')
})

app.get('/invite', (req, res) => {
  res.redirect('/api/invite')
})

app.use((req, res) => {
  res.sendFile(Path.resolve(__dirname, './static', 'site.html'))
})

app.listen(8534, () => {
  console.log('Started')
})