import { Controller, Get, HttpStatus, Query, Redirect } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { OAuth2Scopes, Snowflake } from 'discord-api-types'
import { PermissionUtils } from 'jadl'
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
  inviteBot(
    @Query('id') id: Snowflake | 'undefined',
    @Query('admin') admin?: 'true'
  ) {
    return {
      url:
        'https://discord.com/oauth2/authorize?' +
        new URLSearchParams({
          client_id: Config.id,
          guild_id: id,
          scope: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands].join(
            ' '
          ),
          permissions:
            admin === 'true'
              ? PermissionUtils.bits.administrator.toString()
              : Config.requiredPermissions
                  .reduce(
                    (a, b) => a | Number(PermissionUtils.bits[b.permission]),
                    0
                  )
                  .toString()
        }).toString()
    }
  }
}
