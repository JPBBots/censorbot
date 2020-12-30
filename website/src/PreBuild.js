const fs = require('fs')
const path = require('path')

const minify = require('minify')

const pathTo = {
  html: path.resolve.bind(undefined, __dirname, '../static/html'),
  css: path.resolve.bind(undefined, __dirname, '../static/css')
}

const result = {}

fs.readdirSync(pathTo.html()).forEach(file => {
  const [name, ext] = file.split('.')
  if (ext !== 'html') return
  console.log(`Compiling HTML file ${file}`)

  const contents = fs.readFileSync(pathTo.html(file), 'utf-8')
  if (!result[name]) result[name] = {}

  result[name].html = minify.html(contents)
})

fs.readdirSync(pathTo.css()).forEach(file => {
  const [name, ext] = file.split('.')
  if (ext !== 'css') return
  console.log(`Compiling CSS file ${file}`)

  const contents = fs.readFileSync(pathTo.css(file), 'utf-8')
  if (!result[name]) result[name] = {}

  result[name].css = minify.css(contents)
})

fs.writeFileSync(path.resolve(__dirname, 'web.json'), JSON.stringify(result, null, 4))

console.log('Finished compiling web')