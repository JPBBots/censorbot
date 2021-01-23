const fs = require('fs')
const path = require('path')

const sass = require('sass')
const minify = require('minify')

const pathTo = {
  static: path.resolve.bind(undefined, __dirname, '../static'),
  html: path.resolve.bind(undefined, __dirname, '../static/html'),
  css: path.resolve.bind(undefined, __dirname, '../static/css')
}

console.log('Compiling site.html')

let html = fs.readFileSync(pathTo.html('index.html'), 'utf-8')
const js = fs.readFileSync(pathTo.static('build.js'), 'utf-8')

html = html.replace(/{INDCSS}/, `<style id="indcss">${minify.css(sass.renderSync({ file: pathTo.css('index.scss') }).css.toString('utf-8'))}</style>`)
html = html.replace(/{JS}/, `${js}`)

fs.writeFileSync(pathTo.static('site.html'), html)

console.log('Compiled to /static/site.html')