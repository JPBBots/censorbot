const fs = require('fs')
const path = require('path')

const minify = require('minify')

const defaultConfig = require('../../src/client/Config').config

const pathTo = {
  html: path.resolve.bind(undefined, __dirname, '../static/html'),
  css: path.resolve.bind(undefined, __dirname, '../static/css')
}

const result = {}

fs.readdirSync(pathTo.html()).forEach(file => {
  const [name, ext] = file.split('.')
  if (ext !== 'html') return
  console.log(`Compiling HTML file ${file}`)

  let contents = fs.readFileSync(pathTo.html(file), 'utf-8')
  if (!result[name]) result[name] = {}

  // custom elements
  contents = contents
    .replace(/<center(.+?)>(.+?)<\/center>/gs, `
      <div style="display:block;text-align: -webkit-center"$1>$2</div>
    `)
    .replace(/<PremiumSetting:(.+?) (.+?)>(.+?)<\/PremiumSetting>/gs, `
    <div id="$1" premium>
      <h3>$2 <Star></h3>
      $3
    </div>
    `)
    .replace(/<Setting:(.+?) (.+?)>(.+?)<\/Setting>/gs, `
    <div id="$1">
      <h3>$2</h3>
      $3
    </div>
    `)
    .replace(/<Duration (.+)>/g, `
      <Number min="1" max="60">
      <select onchange="this.parentElement.querySelector('input')[this.value == '' ? 'setAttribute' : 'removeAttribute']('hidden', '')">
        <option value="60000">Minutes</option>
        <option value="3600000">Hours</option>
        <option value="86400000">Days</option>
        <option value>$1</option>
      </select>
    `)
    .replace(/<Number(.*)>/g, `
      <input$1 type="number" pattern="\\d*" inputmode="numeric"
      onchange="this.value==='0'?(this.value=''):this.value>Number(this.max)?(this.value=this.max):this.value<Number(this.min)?(this.value=this.min):null">
    `)
    .replace(/<Button(=.+)? ?(.*)>(.*)<\/Button>/g, `
    <a $2 href$1 class="button">$3</a>
    `)
    .replace(/<Star>/g, `   
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#c2973a" viewBox="0 0 16 16">
        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
      </svg>
    `)
    .replace(/<Switch(\.(premium))?(.*)>/g, `
    <label class="checker">
      <input$3 class="checkbox $2" type="checkbox" />
      <div class="checkmark">
        <svg viewBox="0 0 100 100">
          <path d="M20,55 L40,75 L77,27" fill="none" stroke="#FFF" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </label>
    `)
    .replace(/href(?!=)/g, '')

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
fs.writeFileSync(path.resolve(__dirname, 'config.json'), JSON.stringify(defaultConfig, null, 2))

console.log('Finished compiling web')