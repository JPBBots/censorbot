import { Router } from 'express'
import { ApiManager } from '../../managers/Api'

import qs from 'querystring'

export default function (this: ApiManager, r: Router): void {
  r
    .get('/', (req, res) => {
      res.redirect(`https://${req.query.d ? `${req.query.d as string}.` : ''}discord.com/oauth2/authorize?` + qs.stringify({
        client_id: this.config.id,
        redirect_uri: `https://${req.headers.host}/api/auth/discord/callback`,
        response_type: 'code',
        prompt: 'none',
        scope: this.config.dashboardOptions.scopes.concat(req.query.email === 'true' ? ['email'] : []).join(' ')
      }))
    })

    .get('/callback', async (req, res) => {
      if (!req.query.code) return res.json({ error: 'Missing code' })

      let token
      try {
        token = await this.oauth.callback(req.query.code as string, req.headers.host as string)
        if (!token) return res.json({ error: '' })
      } catch (err) {
        return res.json({ error: err.message })
      }

      res.cookie('token', token)

      res.header('Content-Type', 'text/html')
      res.send(`
        <!DOCTYPE html>
        <html>
          <script>
            window.close();
          </script>
        </html>
      `)
    })
}
