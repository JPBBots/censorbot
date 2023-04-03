import { Controller, Get, HttpStatus, Query, Redirect } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { DatabaseService } from '../services/database.service'
import Config from '@censorbot/config'

import { PermissionUtils } from 'jadl'

import { OAuth2Scopes } from 'discord-api-types/v10'
import { ServerSideProps } from '@censorbot/typings'
import { CacheService } from '../services/cache.service'
import { ThreadService } from '../services/thread.service'

import { ClusterStats } from 'jadl'

@Controller('/')
export class BaseController {
  constructor(
    private readonly database: DatabaseService,
    private readonly caching: CacheService,
    private readonly thread: ThreadService
  ) {}

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
    @Query('id') id: string | undefined,
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

  @Get('/props')
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
}
