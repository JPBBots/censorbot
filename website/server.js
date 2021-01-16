const Express = require('express')
const Path = require('path')

const app = Express()

app.use('/static', Express.static(Path.resolve(__dirname, './static')))

app.get('/web.json', (req, res) => {
  res.sendFile(Path.resolve(__dirname, './src', 'web.json'))
})

app.get('/support', (req, res) => {
  res.redirect('https://discord.gg/v3r2rKP')
})

app.get('/invite', (req, res) => {
  res.redirect('/api/invite')
})

app.use((req, res) => {
  res.sendFile(Path.resolve(__dirname, './static/html', 'index.html'))
})

app.listen(8534, () => {
  console.log('Started')
})