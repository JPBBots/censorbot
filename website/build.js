const fs = require('fs')
const path = require('path')
const minify = require('minify')
const MemoryFs = require('memory-fs')
const sass = require('sass')

const pathTo = {
  src: path.resolve.bind(undefined, __dirname, './src'),
  base: path.resolve.bind(undefined, __dirname, './'),
  build: path.resolve.bind(undefined, __dirname, './build'),
  html: path.resolve.bind(undefined, __dirname, './html'),
  scss: path.resolve.bind(undefined, __dirname, './scss')
}

const postcss = require('postcss')
const autoprefixer = require('autoprefixer')

const processCss = async (file) => {
  return postcss([autoprefixer]).process(minify.css(sass.renderSync({
    file: pathTo.scss(file)
  }).css.toString('utf-8'))).then(x => x.css)
}

const defaultConfig = require('../bot/src/data/DefaultConfig.json');

(async () => {
  const result = {}

  fs.readdirSync(pathTo.html()).forEach(file => {
    const [name, ext] = file.split('.')
    if (ext !== 'html' || name === 'index') return
    console.log(`Compiling HTML file ${file}`)

    let contents = fs.readFileSync(pathTo.html(file), 'utf-8')
    if (!result[name]) result[name] = {}

    // custom elements
    contents = contents
      .replace(/<Tooltip href="(.+?)">(.+?)<\/Tooltip>/gs, `
      <a class="tooltip" href="$1" target="_blank">
        <svg onclick="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
        </svg>
        <span onclick="" class="tooltiptext">$2</span>
      </a>
      `)
      .replace(/<center(.+?)>(.+?)<\/center>/gs, `
        <div style="display:block;text-align: -webkit-center;text-align: center"$1>$2</div>
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

  await Promise.all(fs.readdirSync(pathTo.scss()).map(async file => {
    const [name, ext] = file.split('.')
    if (ext !== 'scss' || name === 'index') return
    console.log(`Compiling SCSS file ${file}`)

    if (!result[name]) result[name] = {}

    result[name].css = await processCss(file)
  }))

  fs.writeFileSync(pathTo.src('web.json'), JSON.stringify(result, null, 4))
  fs.writeFileSync(pathTo.src('config.json'), JSON.stringify(defaultConfig, null, 2))

  console.log('Finished compiling web')

  const wpConfig = require('./webpack.config')
  wpConfig.output = {
    filename: 'build.js',
    path: '/'
  }

  const compiler = require('webpack')(wpConfig)
  const mfs = new MemoryFs()

  await new Promise((resolve, reject) => {
    compiler.run((err, status) => {
      if (status.compilation.errors.length > 0) console.log(status.compilation.errors)
      if (err) reject(err)
      else resolve()
    })
    compiler.outputFileSystem = mfs
  })

  const js = mfs.data['build.js'].toString('utf-8')

  console.log('Finish TS/JS Compile')

  let html = fs.readFileSync(pathTo.html('index.html'), 'utf-8')

  html = html.replace(/{INDCSS}/, `<style id="indcss">${await processCss('index.scss')}</style>`)
  html = html.replace(/{JS}/, `${js}`)

  fs.writeFileSync(pathTo.base('site.html'), minify.html(html))

  console.log('Compiled to /site.html')

  fs.unlinkSync(pathTo.src('web.json'))
  fs.unlinkSync(pathTo.src('config.json'))

  console.log('Cleaned up.')
})()
