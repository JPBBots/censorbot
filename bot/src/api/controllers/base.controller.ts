import { Controller, Get, HttpStatus, Query, Redirect } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { OAuth2Scopes, Snowflake } from 'discord-api-types'
import { PermissionsUtils } from 'discord-rose'
import { Config } from '../../config'

@Controller()
export class BaseController {
  @Get('/')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns info on the HTTP Server'
  })
  getInfo() {
    return {
      hello: 'world',
      worker: 0, // TODO
      region: 'na'
    }
  }

  @Get('/invite')
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: 'Redirects to the invite'
  })
  @Redirect()
  inviteBot(@Query('id') id: Snowflake | 'undefined') {
    return {
      url:
        'https://discord.com/oauth2/authorize?' +
        new URLSearchParams({
          client_id: Config.id,
          guild_id: id,
          scope: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands].join(
            ' '
          ),
          permissions: Config.requiredPermissions
            .reduce((a, b) => a | PermissionsUtils.bits[b.permission], 0)
            .toString()
        }).toString()
    }
  }
}
