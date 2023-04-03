import { Module } from '@nestjs/common'

import { RouterModule } from '@nestjs/core'

import { ApiModule } from '@censorbot/api'
import { SiteModule } from './site/site.module'

@Module({
  imports: [
    ApiModule,
    RouterModule.register([
      {
        path: '/api',
        module: ApiModule
      }
    ]),
    SiteModule
  ]
})
export class AppModule {}
