const Express = require('express')
const Path = require('path')

const { Config } = require('../bot/dist/config')

const { PermissionsUtils } = require('discord-rose')

const qs = require('querystring')

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

const generateOauth = (invite, data, disc, email = false) => {
  const base = `https://${disc ? `${disc}.` : ''}discord.com/oauth2/authorize?${qs.stringify({
    client_id: Config.id
  })}&`

  if (!invite) {
    const scopes = [...Config.dashboardOptions.scopes]
    if (email) scopes.push('email')

    return base + qs.stringify({
      redirect_uri: `https://${data}/callback`,
      response_type: 'code',
      prompt: 'none',
      scope: scopes.join(' ')
    })
  } else {
    return base + qs.stringify({
      permissions: Config.requiredPermissions.reduce((a, b) => a | PermissionsUtils.bits[b.permission], 0),
      scope: 'bot applications.commands',
      guild_id: data
    })
  }
}

app.get('/invite', (req, res) => {
  res.redirect(generateOauth(true, req.query.id))
})

const links = {
  support: 'https://discord.gg/v3r2rKP',
  review: 'https://top.gg/bot/394019914157129728#reviews',
  'servers*': '/dashboard',
  terms: 'https://www.iubenda.com/terms-and-conditions/23592172',
  privacy: 'https://www.iubenda.com/privacy-policy/23592172/full-legal'
}

Object.keys(links).forEach(link => {
  app.get(`/${link}`, (req, res) => {
    res.redirect(links[link])
  })
})

app.use((req, res) => {
  res.sendFile(Path.resolve(__dirname, 'site.html'))
})

app.listen(process.argv.includes('-b') ? 8535 : 8534, () => {
  console.log('Started')
})
