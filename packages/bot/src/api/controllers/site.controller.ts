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
import { ApiResponse } from '@nestjs/swagger'
import { Config } from '../../config'
import { OAuth2Scopes } from 'discord-api-types/v10'
import { Snowflake, PermissionUtils, ClusterStats } from 'jadl'

import { DatabaseService } from '../services/database.service'
import { ServerSideProps } from '@censorbot/typings'
import { ThreadService } from '../services/thread.service'
import { CacheService } from '../services/cache.service'

const pathToWebsite = path.parse(require.resolve('@censorbot/website')).dir

@Controller()
export class SiteController {
  server: ReturnType<typeof Next>
  constructor(
    private readonly database: DatabaseService,
    private readonly thread: ThreadService,
    private readonly caching: CacheService
  ) {
    this.server = Next({
      quiet: true,
      dev: Config.staging,
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
    return {
      url:
        'https://discord.com/oauth2/authorize?' +
        new URLSearchParams({
          client_id: id
            ? this.database.customBots.find((x) => x.guilds.includes(id))?.id ??
              Config.id
            : Config.id,
          guild_id: id ?? 'undefined',
          disable_guild_select: id ? 'true' : 'false',
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

  @Get('/api/props')
  async getProps(): Promise<ServerSideProps> {
    let serverCount = this.caching.meta.get('serverCount')

    if (!serverCount) {
      serverCount = (
        await this.thread.getStats().catch(() => [] as ClusterStats[])
      ).reduce((z, x) => z + x.shards.reduce((a, b) => a + b.guilds, 0), 0)

      this.caching.meta.set('serverCount', serverCount)
    }

    return {
      serverCount,
      trialLength: Config.trialLength
    }
  }

  @Get('*')
  async get(@Req() req: Request, @Res() res: Response) {
    void this.server.getRequestHandler()(req, res)
  }
}
