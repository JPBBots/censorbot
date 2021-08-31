import { Database } from '../structures/Database'
import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { BaseController } from './controllers/base.controller'
import { DiscordAuthController } from './controllers/auth/discord.controller'

import { UserGateway } from './gateway/user.gateway'

import { GatewayAuthGuard } from './guards/authorized.guard'

import { OAuthService } from './services/oauth.service'
import { DiscordService } from './services/discord.service'
import { UsersService } from './services/users.service'
import { ChargeBeeService } from './services/chargebee.service'
import { DatabaseService } from './services/database.service'
import { InterfaceService } from './services/interface.service'
import { CacheService } from './services/cache.service'

@Module({
  imports: [GatewayAuthGuard],
  controllers: [BaseController, DiscordAuthController],
  providers: [
    Database,
    Reflector,

    CacheService,
    DatabaseService,
    DiscordService,
    InterfaceService,
    OAuthService,
    UsersService,
    ChargeBeeService,

    UserGateway
  ]
})
export class AppModule {}
