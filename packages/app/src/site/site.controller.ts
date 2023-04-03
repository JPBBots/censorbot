import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Redirect,
  Req,
  Res
} from '@nestjs/common'
import { Request, Response } from 'express'

import path from 'path'

import Next from 'next'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import Config from '@censorbot/config'
import { OAuth2Scopes } from 'discord-api-types/v10'
import { Snowflake, PermissionUtils, ClusterStats } from 'jadl'

const pathToWebsite = path.parse(require.resolve('@censorbot/website')).dir

@Controller()
@ApiTags('Site')
export class SiteController {
  server: ReturnType<typeof Next>
  constructor() {
    this.server = Next({
      quiet: true,
      dev: false,
      dir: pathToWebsite
    })

    void this.server.prepare()
  }

  @Get('/invite')
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: 'Redirects to the invite'
  })
  @Redirect()
  inviteBot(
    @Query('id') id: Snowflake | undefined,
    @Query('admin') admin?: 'true'
  ) {
    const query = new URLSearchParams()

    if (id) query.append('id', id)
    if (admin) query.append('admin', admin)

    return {
      url: `/api/invite?${query.toString()}`
    }
  }

  @Get('/privacy')
  @Redirect(Config.links.privacyPolicy)
  privacyPolicy() {
    return true
  }

  @Get('/terms')
  @Redirect(Config.links.terms)
  terms() {
    return true
  }

  @Get('/support')
  @Redirect(Config.links.support)
  support() {
    return true
  }

  @Get('*')
  async get(@Req() req: Request, @Res() res: Response) {
    void this.server.getRequestHandler()(req, res)
  }
}
