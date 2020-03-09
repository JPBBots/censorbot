const express = require('express')
const app = express()

const Filter = require('./class.js')
const filter = new Filter(null, './linkbyp.json')

const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.post('/', (req, res) => {
  if (req.body.global === true) req.body.global = ['en', 'es', 'off']
  const response = filter.test(req.body.content, req.body.global, req.body.server, req.body.uncensor)
  res.json(response)
})

app.get('/reload', (req, res) => {
  res.json({ restart: true })
  console.log('Filter restarting...')
  process.exit()
})

app.listen(6993, () => {
  console.log("Filter started")
})