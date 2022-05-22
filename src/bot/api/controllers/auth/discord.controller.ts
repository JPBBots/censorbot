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
import { OAuth2Scopes, RESTOAuth2AuthorizationQuery } from 'discord-api-types/v9'
import { Response } from 'express'
import { Config } from '../../../config'
import { OAuthService } from '../../services/oauth.service'

@Controller('/api/auth/discord')
export class DiscordAuthController {
  constructor(private readonly oauth: OAuthService) {}

  private getHttps(referer: string) {
    return referer.startsWith('https')
  }

  private getUrl(host: string, https: boolean) {
    return `${https ? 'https' : 'http'}://${host}`
  }

  @Get('/')
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: 'Redirects to login URL'
  })
  @Redirect()
  goToLogin(
    @Query() query: { d?: string; email?: 'true' | 'false' },
    @Headers('host') host: string,
    @Headers('referer') referer: string
  ) {
    const authQuery: RESTOAuth2AuthorizationQuery = {
      client_id: Config.id,
      redirect_uri: `${this.getUrl(
        host,
        this.getHttps(referer)
      )}/api/auth/discord/callback`,
      response_type: 'code',
      prompt: 'none',
      scope: Config.dashboardOptions.scopes
        .concat(query.email === 'true' ? [OAuth2Scopes.Email] : [])
        .join(' '),
      state: this.getHttps(referer) ? 'true' : 'false'
    }
    return {
      url:
        `https://${
          query.d ? `${query.d as string}.` : ''
        }discord.com/oauth2/authorize?` +
        new URLSearchParams(
          authQuery as unknown as Record<string, string>
        ).toString()
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
    @Query('state') https: 'true' | 'false',
    @Headers('host') host: string,
    @Res() res: Response
  ) {
    if (!code) throw new HttpException('Missing Code', HttpStatus.BAD_REQUEST)

    let token: string
    try {
      token = await this.oauth.callback(code, host, https === 'true')
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
