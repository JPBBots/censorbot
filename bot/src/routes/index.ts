import { Router } from 'express'
import { ApiManager } from '../managers/Api'
import qs from 'querystring'
import { PermissionsUtils, Snowflake } from 'discord-rose'

export default function (this: ApiManager, r: Router): void {
  r
    .get('/', (req, res) => {
      res.json({
        hello: 'world',
        worker: this.id,
        region: this.region
      })
    })
    .get<any, any, any, any, { id: Snowflake }>('/invite', (req, res) => {
    res.redirect('https://discord.com/oauth2/authorize?' + qs.stringify({
      client_id: this.config.id,
      permissions: this.config.requiredPermissions.reduce((a, b) => a | PermissionsUtils.bits[b.permission], 0),
      guild_id: req.query.id,
      scope: ['bot', 'applications.commands'].join(' ')
    }))
  })
}
