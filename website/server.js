const Express = require('express')
const Path = require('path')

const { exec } = require('child_process')

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh (cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

const app = Express()

app.use('/static', Express.static(Path.resolve(__dirname, './static')))

app.delete('/', (req, res) => {
  sh('npm run buildsite').then(() => res.send('e'))
})

app.get('/robots.txt', (req, res) => {
  res.send(
`
User-agent: *
Disallow: /admin
Disallow: /tickets
Disallow: /dashboard/*
`
  )
})

app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'text/xml')
  res.send(
`
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://censor.bot/</loc>
    <lastmod>2021-03-01T23:28:22+00:00</lastmod>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>https://censor.bot/invite</loc>
    <lastmod>2021-03-01T23:28:22+00:00</lastmod>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://censor.bot/dashboard</loc>
    <lastmod>2021-03-01T23:28:22+00:00</lastmod>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://censor.bot/premium</loc>
    <lastmod>2021-03-01T23:28:22+00:00</lastmod>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://censor.bot/support</loc>
    <lastmod>2021-03-01T23:28:22+00:00</lastmod>
    <priority>0.70</priority>
  </url>
</urlset>
`)
})

app.get('/auth', (req, res) => {
  res.redirect(`https://discord.com/oauth2/authorize?client_id=707322836011974667&redirect_uri=https://${req.headers.host}/callback&response_type=code&prompt=none&scope=identify%20guilds`)
})

app.get('/callback', (req, res) => {
  res.header('Content-Type', 'text/html')
  res.send(`
    <!DOCTYPE html>
    <html>
      <script>
        localStorage.setItem('code', '${req.query.code}')
        window.close()
      </script>
    </html>
  `)
})

app.get('/support', (req, res) => {
  res.redirect('https://discord.gg/v3r2rKP')
})

app.get('/review', (req, res) => {
  res.redirect('https://top.gg/bot/394019914157129728#reviews')
})

app.get('/stats', (req, res) => {
  res.redirect('https://p.datadoghq.com/sb/iib7eqa83t2bea4n-3c71c6e3122e2ad6ad1b7546bb4ee491?from_ts=1611093578306&live=true&theme=dark&to_ts=1611179978306&tpl_var_var=%2A&tv_mode=false')
})

app.get('/servers*', (req, res) => {
  res.redirect('/dashboard')
})

app.get('/invite', (req, res) => {
  res.redirect('/api/invite')
})

app.use((req, res) => {
  res.sendFile(Path.resolve(__dirname, 'site.html'))
})

app.listen(process.argv.includes('-b') ? 8535 : 8534, () => {
  console.log('Started')
})
