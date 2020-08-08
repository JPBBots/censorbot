const Express = require('express')

const app = Express()

const resolve = require('path').resolve.bind(undefined, __dirname)

app.set('view engine', 'ejs')
app.set('views', resolve('./views'))

app.use('/static', Express.static(resolve('./static')))

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/tos', (req, res) => {
  res.render('tos')
})

app.get('/about', (req, res) => {
  res.render('about')
})

app.get('/invite', (req, res) => {
  res.render('invite')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/support', (req, res) => {
  res.redirect('https://discord.gg/mx6Gcdb')
})

app.get('/admin', (req, res) => {
  res.render('admin')
})

app.get('/tickets', (req, res) => {
  res.render('tickets')
})

app.get('/premium', (req, res) => {
  res.render('premium')
})

app.get('/servers', (req, res) => {
  res.render('guilds', { dash: true })
})

app.get('/servers/([0-9]{15,18})', (req, res) => {
  res.render('guild', { dash: true })
})

app.listen(process.argv.includes('-b') ? 1045 : 1044, () => {
  console.log('Started')
})
