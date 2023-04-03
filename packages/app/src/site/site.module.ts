import { Module } from '@nestjs/common'
import { SiteController } from './site.controller'

@Module({
  controllers: [SiteController]
})
export class SiteModule {}
