import {
  Controller,
  Get,
  Query,
  Res,
  Headers,
  HttpException,
  HttpStatus,
  Redirect,
  Header
} from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { OAuth2Scopes } from 'discord-api-types'
import { Response } from 'express'
import { Config } from '../../../config'
import { OAuthService } from '../../services/oauth.service'

@Controller('auth/discord')
export class DiscordAuthController {
  constructor(private readonly oauth: OAuthService) {}

  @Get('/')
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: 'Redirects to login URL'
  })
  @Redirect()
  goToLogin(
    @Query() query: { d?: string; email?: 'true' | 'false' },
    @Headers('host') host: string
  ) {
    return {
      url:
        `https://${
          query.d ? `${query.d as string}.` : ''
        }discord.com/oauth2/authorize?` +
        new URLSearchParams({
          client_id: Config.id,
          redirect_uri: `https://${host}/api/auth/discord/callback`,
          response_type: 'code',
          prompt: 'none',
          scope: Config.dashboardOptions.scopes
            .concat(query.email === 'true' ? [OAuth2Scopes.Email] : [])
            .join(' ')
        }).toString()
    }
  }

  @Get('/callback')
  @Header('Content-Type', 'text/html')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accepts and processes code and stores token in cookies'
  })
  async callback(
    @Query('code') code: string | undefined,
    @Headers('host') host: string,
    @Res() res: Response
  ) {
    if (!code) throw new HttpException('Missing Code', HttpStatus.BAD_REQUEST)

    let token: string
    try {
      token = await this.oauth.callback(code, host)
      if (!token)
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }

    res.cookie('token', token)

    res.send(`
      <!DOCTYPE html>
      <html>
        <script>
          window.close();
        </script>
      </html>
    `)
  }
}
