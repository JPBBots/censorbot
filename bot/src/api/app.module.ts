import { Database } from '../structures/Database'
import { Module } from '@nestjs/common'

import { BaseController } from './controllers/base.controller'
import { DiscordAuthController } from './controllers/auth/discord.controller'

import { UserGateway } from './gateway/user.gateway'

import { OAuthService } from './services/oauth.service'
import { DiscordService } from './services/discord.service'

@Module({
  imports: [],
  controllers: [BaseController, DiscordAuthController],
  providers: [Database, OAuthService, DiscordService, UserGateway]
})
export class AppModule {}
